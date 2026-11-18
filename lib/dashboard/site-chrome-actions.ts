"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { chromeSeed } from "./site-chrome-seed";
import type { SiteChromeArea, SiteChromeInput, SiteChromeItem, SiteChromeKind } from "./site-chrome-types";
import { syncSiteChromeTranslation } from "@/lib/translation-service";
import { requireDashboardSession } from "./auth";

async function ensureChromeSeeded() {
  for (const [area, kind, sectionKey, fieldKey, label, value, url, imageUrl, altText, isVisible, sortOrder] of chromeSeed) {
    await prisma.siteChromeContent.upsert({
      where: { area_sectionKey_fieldKey: { area: area as SiteChromeArea, sectionKey, fieldKey } },
      update: { kind: kind as SiteChromeKind },
      create: { area: area as SiteChromeArea, kind: kind as SiteChromeKind, sectionKey, fieldKey, label, value, url: url || null, imageUrl: imageUrl || null, altText: altText || null, isVisible, sortOrder },
    });
  }
}

function validateSharedUrl(value: string) {
  const input = value.trim();
  if (!input) return null;
  if (input.includes("\\") || input.startsWith("//")) throw new Error("URL không hợp lệ.");
  if (input.startsWith("/") && !input.startsWith("//")) return input;
  if (/^tel:\+?[0-9 .()-]+$/i.test(input) || /^mailto:[^\s@]+@[^\s@]+$/i.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.protocol === "https:" && !url.username && !url.password) return url.toString();
  } catch {}
  throw new Error("URL chỉ được là đường dẫn nội bộ, tel:, mailto: hoặc HTTPS an toàn.");
}

function validateSharedMediaUrl(value: string) {
  const input = value.trim();
  if (!input) return null;
  if (/^\/(?:api\/media(?:\/|\?|$)|assets\/|uploads\/)/.test(input)) return input;
  try {
    const url = new URL(input);
    const official = new URL(process.env.SITE_URL || "https://gedeco.vn");
    if (url.protocol === "https:" && url.hostname.replace(/^www\./, "") === official.hostname.replace(/^www\./, "") && !url.username && !url.password && !url.port) return url.toString();
  } catch {}
  throw new Error("Media phải thuộc thư viện nội bộ hoặc domain chính thức.");
}

function translatedString(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object") return "";
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function toItem(row: { id: string; area: SiteChromeArea; kind: SiteChromeKind; sectionKey: string; fieldKey: string; label: string; value: string; url: string | null; imageUrl: string | null; altText: string | null; imageCaption: string | null; isVisible: boolean; sortOrder: number; updatedAt: Date }, translation?: { payload: unknown; manualOverride: boolean; status: string; errorMessage: string | null }): SiteChromeItem {
  const isSystem = chromeSeed.some(([area, , sectionKey, fieldKey]) => area === row.area && sectionKey === row.sectionKey && fieldKey === row.fieldKey);
  return { ...row, url: row.url ?? "", imageUrl: row.imageUrl ?? "", altText: row.altText ?? "", imageCaption: row.imageCaption ?? "", updatedAt: row.updatedAt.toISOString(), translationMode: translation?.manualOverride ? "MANUAL" : "AUTO", translationStatus: translation?.status || "PENDING", translationError: translation?.errorMessage || "", labelEn: translatedString(translation?.payload, "label"), valueEn: translatedString(translation?.payload, "value"), altTextEn: translatedString(translation?.payload, "altText"), imageCaptionEn: translatedString(translation?.payload, "imageCaption"), isSystem };
}

export async function listSiteChrome(area: SiteChromeArea, kind: SiteChromeKind = "DYNAMIC"): Promise<SiteChromeItem[]> {
  await requireDashboardSession();
  await ensureChromeSeeded();
  const rows = await prisma.siteChromeContent.findMany({ where: { area, kind }, orderBy: [{ sortOrder: "asc" }, { sectionKey: "asc" }] });
  const translations = await prisma.translationEntry.findMany({ where: { entityType: "SITE_CHROME", locale: "en", entityId: { in: rows.map((row) => row.id) } } });
  const byId = new Map(translations.map((translation) => [translation.entityId, translation]));
  return rows.map((row) => toItem(row, byId.get(row.id)));
}

export async function saveSiteChrome(input: SiteChromeInput): Promise<{ ok: true; item: SiteChromeItem; translation: { status: string; errorMessage: string | null } }> {
  await requireDashboardSession();
  if (!/^[a-z][A-Za-z0-9]{0,49}$/.test(input.sectionKey.trim()) || !/^[a-z][A-Za-z0-9]{0,49}$/.test(input.fieldKey.trim()) || !input.label.trim()) throw new Error("Section key/field key phải bắt đầu bằng chữ thường, chỉ gồm chữ và số; nhãn không được để trống.");
  if (input.label.trim().length > 120 || input.value.length > 5000) throw new Error("Nhãn hoặc nội dung vượt quá giới hạn cho phép.");
  if (input.imageUrl.trim() && !input.altText.trim()) throw new Error("Media phải có alt text tiếng Việt.");
  const data = {
    area: input.area,
    kind: input.kind,
    sectionKey: input.sectionKey.trim(),
    fieldKey: input.fieldKey.trim(),
    label: input.label.trim(),
    value: input.value,
    url: validateSharedUrl(input.url),
    imageUrl: validateSharedMediaUrl(input.imageUrl),
    altText: input.altText.trim() || null,
    imageCaption: input.imageCaption.trim() || null,
    isVisible: input.isVisible,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
  };
  const saved = await prisma.$transaction(async (tx) => {
    const row = await tx.siteChromeContent.upsert({ where: { area_sectionKey_fieldKey: { area: input.area, sectionKey: data.sectionKey, fieldKey: data.fieldKey } }, update: data, create: data });
    const previous = await tx.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "SITE_CHROME", entityId: row.id, locale: "en" } } });
    if (input.translationMode !== "MANUAL") return { row, translation: previous };
    if (!input.valueEn.trim() && input.value.trim()) throw new Error("Giá trị English không được để trống khi chọn tự nhập và duyệt.");
    if (input.imageUrl.trim() && !input.altTextEn.trim()) throw new Error("Media phải có alt text English.");
    const sourceHash = crypto.createHash("sha256").update(JSON.stringify({ label: row.label, value: row.value, altText: row.altText || "", imageCaption: row.imageCaption || "", h1: "", metaTitle: "", metaDescription: "" })).digest("hex");
    const payload = { label: input.labelEn.trim() || input.label.trim(), value: input.valueEn, altText: input.altTextEn.trim(), imageCaption: input.imageCaptionEn.trim(), h1: "", metaTitle: "", metaDescription: "" };
    const translation = await tx.translationEntry.upsert({
      where: { entityType_entityId_locale: { entityType: "SITE_CHROME", entityId: row.id, locale: "en" } },
      create: { entityType: "SITE_CHROME", entityId: row.id, locale: "en", payload, sourceUpdatedAt: row.updatedAt, sourceHash, status: "TRANSLATED", provider: "manual", manualOverride: true, translatedAt: new Date(), reviewedAt: new Date() },
      update: { payload, sourceUpdatedAt: row.updatedAt, sourceHash, status: "TRANSLATED", provider: "manual", manualOverride: true, errorMessage: null, translatedAt: new Date(), reviewedAt: new Date() },
    });
    return { row, translation };
  });
  let translation = saved.translation;
  if (input.translationMode !== "MANUAL") {
    if (translation?.manualOverride) await prisma.translationEntry.update({ where: { id: translation.id }, data: { manualOverride: false } });
    translation = await syncSiteChromeTranslation({ id: saved.row.id, label: saved.row.label, value: saved.row.value, altText: saved.row.altText || "", imageCaption: saved.row.imageCaption || "", updatedAt: saved.row.updatedAt });
  }
  const item = toItem(saved.row, translation || undefined);
  return { ok: true, item, translation: { status: translation?.status || "PENDING", errorMessage: translation?.errorMessage || null } };
}

export async function deleteSiteChrome(id: string): Promise<{ ok: true }> {
  await requireDashboardSession();
  const row = await prisma.siteChromeContent.findUnique({ where: { id }, select: { area: true, sectionKey: true, fieldKey: true } });
  if (!row) return { ok: true };
  const seeded = chromeSeed.some(([area, , sectionKey, fieldKey]) => area === row.area && sectionKey === row.sectionKey && fieldKey === row.fieldKey);
  if (seeded) throw new Error("Nội dung hệ thống không thể xóa; hãy tắt “Hiển thị trên frontend” nếu không muốn sử dụng.");
  await prisma.$transaction([prisma.translationEntry.deleteMany({ where: { entityType: "SITE_CHROME", entityId: id } }), prisma.siteChromeContent.delete({ where: { id } })]);
  return { ok: true };
}
