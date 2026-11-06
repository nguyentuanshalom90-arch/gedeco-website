"use server";

import { prisma } from "@/lib/prisma";
import { chromeSeed } from "./site-chrome-seed";
import type { SiteChromeArea, SiteChromeInput, SiteChromeItem, SiteChromeKind } from "./site-chrome-types";

function assertDashboardWriteAllowed() {
  if (process.env.NODE_ENV === "production") throw new Error("Chưa cấu hình xác thực quản trị cho môi trường production.");
}

async function ensureChromeSeeded() {
  for (const [area, kind, sectionKey, fieldKey, label, value, url, imageUrl, altText, isVisible, sortOrder] of chromeSeed) {
    await prisma.siteChromeContent.upsert({
      where: { area_sectionKey_fieldKey: { area: area as SiteChromeArea, sectionKey, fieldKey } },
      update: { kind: kind as SiteChromeKind },
      create: { area: area as SiteChromeArea, kind: kind as SiteChromeKind, sectionKey, fieldKey, label, value, url: url || null, imageUrl: imageUrl || null, altText: altText || null, isVisible, sortOrder },
    });
  }
}

function toItem(row: { id: string; area: SiteChromeArea; kind: SiteChromeKind; sectionKey: string; fieldKey: string; label: string; value: string; url: string | null; imageUrl: string | null; altText: string | null; isVisible: boolean; sortOrder: number; updatedAt: Date }): SiteChromeItem {
  return { ...row, url: row.url ?? "", imageUrl: row.imageUrl ?? "", altText: row.altText ?? "", updatedAt: row.updatedAt.toISOString() };
}

export async function listSiteChrome(area: SiteChromeArea, kind: SiteChromeKind = "DYNAMIC"): Promise<SiteChromeItem[]> {
  await ensureChromeSeeded();
  const rows = await prisma.siteChromeContent.findMany({ where: { area, kind }, orderBy: [{ sortOrder: "asc" }, { sectionKey: "asc" }] });
  return rows.map(toItem);
}

export async function saveSiteChrome(input: SiteChromeInput): Promise<{ ok: true; item: SiteChromeItem }> {
  assertDashboardWriteAllowed();
  if (!input.sectionKey.trim() || !input.fieldKey.trim() || !input.label.trim()) throw new Error("Vui lòng nhập section key, field key và nhãn nội dung.");
  const data = {
    area: input.area,
    kind: input.kind,
    sectionKey: input.sectionKey.trim(),
    fieldKey: input.fieldKey.trim(),
    label: input.label.trim(),
    value: input.value,
    url: input.url.trim() || null,
    imageUrl: input.imageUrl.trim() || null,
    altText: input.altText.trim() || null,
    isVisible: input.isVisible,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
  };
  const row = await prisma.siteChromeContent.upsert({ where: { area_sectionKey_fieldKey: { area: input.area, sectionKey: data.sectionKey, fieldKey: data.fieldKey } }, update: data, create: data });
  return { ok: true, item: toItem(row) };
}

export async function deleteSiteChrome(id: string): Promise<{ ok: true }> {
  assertDashboardWriteAllowed();
  await prisma.siteChromeContent.delete({ where: { id } });
  return { ok: true };
}
