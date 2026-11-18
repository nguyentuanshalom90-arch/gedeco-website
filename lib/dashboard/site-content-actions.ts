"use server";

import { prisma } from "@/lib/prisma";
import type { SiteContentInput, SiteContentItem, SiteContentKind } from "./site-content-types";
import { syncSiteContentTranslation } from "@/lib/translation-service";
import { requireDashboardSession } from "./auth";
import { ensureSiteContentSeeded } from "@/lib/site-content-seeding";
import { revalidatePath } from "next/cache";
import { validateManagedMediaUrl } from "./media-url";
import { validateOfficialCanonical } from "./canonical-url";

const dbKind = (kind: SiteContentKind) => kind === "static" ? "STATIC" as const : "DYNAMIC" as const;
const englishRoute: Record<string, string> = { "/": "/en", "/gioi-thieu": "/en/about", "/tin-tuc": "/en/news", "/san-pham": "/en/products", "/lien-he": "/en/contact" };
function revalidateContentRoutes(route: string) { revalidatePath(route); if (englishRoute[route]) revalidatePath(englishRoute[route]); }

function toItem(row: any): SiteContentItem {
  return {
    id: row.id,
    pageKey: row.pageKey,
    pageName: row.page.name,
    route: row.page.route,
    h1: row.page.h1 ?? "",
    metaTitle: row.page.metaTitle ?? "",
    metaDescription: row.page.metaDescription ?? "",
    canonicalUrl: row.page.canonicalUrl ?? "",
    robotsIndex: row.page.robotsIndex,
    robotsFollow: row.page.robotsFollow,
    sectionKey: row.sectionKey,
    fieldKey: row.fieldKey,
    label: row.label,
    value: row.value,
    contentType: row.contentType,
    headingLevel: row.headingLevel ?? "",
    imageUrl: row.imageUrl ?? "",
    altText: row.altText ?? "",
    imageCaption: row.imageCaption ?? "",
    isVisible: row.isVisible,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export async function listSiteContent(kind: SiteContentKind): Promise<SiteContentItem[]> {
  await requireDashboardSession();
  await ensureSiteContentSeeded();
  const rows = await prisma.siteDynamicContent.findMany({ where: { kind: dbKind(kind) }, include: { page: true }, orderBy: [{ pageKey: "asc" }, { sortOrder: "asc" }] });
  return rows.map(toItem);
}

export async function saveSiteContent(kind: SiteContentKind, input: SiteContentInput): Promise<{ ok: true; item: SiteContentItem; translation: { status: string; errorMessage: string | null } }> {
  await requireDashboardSession();
  const pageKey = input.pageKey.trim();
  const sectionKey = input.sectionKey.trim();
  const fieldKey = input.fieldKey.trim();
  if (!pageKey || !sectionKey || !fieldKey || !input.label.trim()) throw new Error("Vui lòng nhập đủ page key, section key, field key và nhãn nội dung.");
  if (!input.h1.trim()) throw new Error("Mỗi page phải có đúng một H1 page để đảm bảo cấu trúc SEO.");
  if (!input.metaTitle.trim() || input.metaTitle.trim().length > 60) throw new Error("SEO title bắt buộc và không vượt quá 60 ký tự.");
  if (!input.metaDescription.trim() || input.metaDescription.trim().length > 160) throw new Error("Meta description bắt buộc và không vượt quá 160 ký tự.");
  if (!input.canonicalUrl.trim()) throw new Error("Canonical URL là bắt buộc cho mỗi page.");
  const canonicalUrl = validateOfficialCanonical(input.canonicalUrl, { fieldLabel: "Canonical page" });
  if (input.imageUrl.trim() && !input.altText.trim()) throw new Error("Ảnh nội dung phải có alt text.");
  if (input.headingLevel === "H1") {
    const duplicate = await prisma.siteDynamicContent.findFirst({ where: { kind: dbKind(kind), pageKey, headingLevel: "H1", ...(input.id ? { NOT: { id: input.id } } : {}) } });
    if (duplicate) throw new Error("Mỗi page chỉ được có một heading H1.");
  }
  const page = await prisma.siteContentPage.upsert({
    where: { pageKey },
    update: {
      name: input.pageName?.trim() || pageKey,
      route: input.route.trim() || "/",
      h1: input.h1.trim() || null,
      metaTitle: input.metaTitle.trim() || null,
      metaDescription: input.metaDescription.trim() || null,
      canonicalUrl,
      robotsIndex: input.robotsIndex,
      robotsFollow: input.robotsFollow,
    },
    create: {
      pageKey,
      name: input.pageName?.trim() || pageKey,
      route: input.route.trim() || "/",
      h1: input.h1.trim() || null,
      metaTitle: input.metaTitle.trim() || null,
      metaDescription: input.metaDescription.trim() || null,
      canonicalUrl,
      robotsIndex: input.robotsIndex,
      robotsFollow: input.robotsFollow,
    },
  });
  const data = {
    kind: dbKind(kind),
    pageKey,
    sectionKey,
    fieldKey,
    label: input.label.trim(),
    value: input.value,
    contentType: input.contentType,
    headingLevel: input.headingLevel || null,
    imageUrl: validateManagedMediaUrl(input.imageUrl, "Ảnh nội dung"),
    altText: input.altText.trim() || null,
    imageCaption: input.imageCaption.trim() || null,
    isVisible: input.isVisible,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
  };
  const row = await prisma.siteDynamicContent.upsert({ where: { kind_pageKey_sectionKey_fieldKey: { kind: dbKind(kind), pageKey, sectionKey, fieldKey } }, update: data, create: data, include: { page: true } });
  const item = toItem({ ...row, page: page || row.page });
  const translation = await syncSiteContentTranslation({ id: item.id, label: item.label, value: item.value, altText: item.altText, imageCaption: item.imageCaption, h1: item.h1, metaTitle: item.metaTitle, metaDescription: item.metaDescription, updatedAt: new Date(item.updatedAt) });
  revalidateContentRoutes(page.route);
  return { ok: true, item, translation: { status: translation.status, errorMessage: translation.errorMessage } };
}

export async function deleteSiteContent(kind: SiteContentKind, id: string): Promise<{ ok: true }> {
  await requireDashboardSession();
  const row = await prisma.siteDynamicContent.findUnique({ where: { id }, select: { kind: true, page: { select: { route: true } } } });
  if (!row || row.kind !== dbKind(kind)) return { ok: true };
  await prisma.$transaction([
    prisma.translationEntry.deleteMany({ where: { entityType: "SITE_CONTENT", entityId: id } }),
    prisma.siteDynamicContent.delete({ where: { id } }),
  ]);
  revalidateContentRoutes(row.page.route);
  return { ok: true };
}
