"use server";

import { prisma } from "@/lib/prisma";
import { syncSitePageTranslation } from "@/lib/translation-service";
import { requireDashboardSession } from "./auth";
import { validateOfficialCanonical } from "./canonical-url";

export type SitePageInput = {
  id?: string;
  slug: string;
  name: string;
  title: string;
  excerpt?: string;
  sections: unknown;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  englishTitle?: string;
  englishExcerpt?: string;
  englishMetaTitle?: string;
  englishMetaDescription?: string;
  englishSections?: unknown;
};

export type SitePageSectionInput = {
  type: "hero" | "text" | "feature-grid" | "cta";
  eyebrow?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  items?: Array<{ title: string; body: string }>;
  buttonLabel?: string;
  buttonHref?: string;
};

function safePageUrl(value: string, label: string) {
  const input = value.trim();
  if (!input) return "";
  if (input.startsWith("/") && !input.startsWith("//") && !input.includes("\\")) return input;
  try {
    const url = new URL(input);
    if (url.protocol === "https:" && ["gedeco.vn", "www.gedeco.vn"].includes(url.hostname.toLowerCase()) && !url.username && !url.password && !url.port && !url.hash) return input;
  } catch {}
  throw new Error(`${label} phải là đường dẫn nội bộ hoặc HTTPS của gedeco.vn.`);
}

function validateSections(value: unknown): SitePageSectionInput[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error("Page phải có ít nhất một section.");
  if (value.length > 30) throw new Error("Một page không nên vượt quá 30 section.");
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error(`Section ${index + 1} không hợp lệ.`);
    const section = raw as SitePageSectionInput;
    if (!["hero", "text", "feature-grid", "cta"].includes(section.type)) throw new Error(`Loại section ${index + 1} không hợp lệ.`);
    if (!section.title?.trim()) throw new Error(`Section ${index + 1} cần có tiêu đề.`);
    if (section.imageUrl?.trim() && !section.imageAlt?.trim()) throw new Error(`Ảnh ở section ${index + 1} cần alt text.`);
    if (section.imageUrl?.trim()) safePageUrl(section.imageUrl, `Ảnh ở section ${index + 1}`);
    if (section.type === "feature-grid" && (!Array.isArray(section.items) || section.items.length === 0)) throw new Error(`Section ${index + 1} cần ít nhất một ô nội dung.`);
    if (section.type === "cta" && Boolean(section.buttonLabel?.trim()) !== Boolean(section.buttonHref?.trim())) throw new Error(`Section ${index + 1} cần đủ nhãn và liên kết nút.`);
    if (section.buttonHref) safePageUrl(section.buttonHref, `Liên kết nút ở section ${index + 1}`);
    return section;
  });
}

export async function listSitePages() {
  await requireDashboardSession();
  const pages = await prisma.sitePage.findMany({ orderBy: { updatedAt: "desc" } });
  const translations = pages.length ? await prisma.translationEntry.findMany({ where: { entityType: "SITE_PAGE", locale: "en", entityId: { in: pages.map((page) => page.id) } } }) : [];
  const byId = new Map(translations.map((entry) => [entry.entityId, entry]));
  return pages.map((page) => ({ ...page, englishTranslation: byId.get(page.id)?.payload || null }));
}

export async function saveSitePage(input: SitePageInput) {
  await requireDashboardSession();
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug || !input.name.trim() || !input.title.trim()) throw new Error("Slug, tên page và tiêu đề là bắt buộc.");
  if (!input.metaTitle.trim() || input.metaTitle.trim().length > 60) throw new Error("SEO title bắt buộc và không vượt quá 60 ký tự.");
  if (!input.metaDescription.trim() || input.metaDescription.trim().length > 160) throw new Error("Meta description bắt buộc và không vượt quá 160 ký tự.");
  const sections = validateSections(input.sections);
  const canonicalUrl = validateOfficialCanonical(input.canonicalUrl?.trim() || `/pages/${slug}`, { fieldLabel: "Canonical page", pathPrefix: "/pages/" }) || `/pages/${slug}`;
  const row = input.id
    ? await prisma.sitePage.update({ where: { id: input.id }, data: { slug, name: input.name.trim(), title: input.title.trim(), excerpt: input.excerpt?.trim() || null, sections: sections as object, metaTitle: input.metaTitle.trim(), metaDescription: input.metaDescription.trim(), canonicalUrl, robotsIndex: input.robotsIndex, robotsFollow: input.robotsFollow, status: input.status } })
    : await prisma.sitePage.create({ data: { slug, name: input.name.trim(), title: input.title.trim(), excerpt: input.excerpt?.trim() || null, sections: sections as object, metaTitle: input.metaTitle.trim(), metaDescription: input.metaDescription.trim(), canonicalUrl, robotsIndex: input.robotsIndex, robotsFollow: input.robotsFollow, status: input.status } });
  const englishSections = Array.isArray(input.englishSections) ? validateSections(input.englishSections) : null;
  const manualEnglish = Boolean(input.englishTitle?.trim() && input.englishMetaTitle?.trim() && input.englishMetaDescription?.trim() && englishSections);
  const translation = manualEnglish
    ? await prisma.translationEntry.upsert({
        where: { entityType_entityId_locale: { entityType: "SITE_PAGE", entityId: row.id, locale: "en" } },
        create: { entityType: "SITE_PAGE", entityId: row.id, locale: "en", slug, payload: { title: input.englishTitle!.trim(), excerpt: input.englishExcerpt?.trim() || "", metaTitle: input.englishMetaTitle!.trim(), metaDescription: input.englishMetaDescription!.trim(), sections: englishSections }, sourceUpdatedAt: row.updatedAt, sourceHash: `manual-${row.updatedAt.toISOString()}`, status: "TRANSLATED", provider: "manual", manualOverride: true, translatedAt: new Date(), reviewedAt: new Date() },
        update: { slug, payload: { title: input.englishTitle!.trim(), excerpt: input.englishExcerpt?.trim() || "", metaTitle: input.englishMetaTitle!.trim(), metaDescription: input.englishMetaDescription!.trim(), sections: englishSections }, sourceUpdatedAt: row.updatedAt, sourceHash: `manual-${row.updatedAt.toISOString()}`, status: "TRANSLATED", provider: "manual", manualOverride: true, errorMessage: null, translatedAt: new Date(), reviewedAt: new Date() },
      })
    : await syncSitePageTranslation(row);
  return { ok: true as const, page: row, translation: { status: translation.status, errorMessage: translation.errorMessage } };
}

export async function deleteSitePage(id: string) {
  await requireDashboardSession();
  await prisma.$transaction([
    prisma.translationEntry.deleteMany({ where: { entityType: "SITE_PAGE", entityId: id } }),
    prisma.sitePage.delete({ where: { id } }),
  ]);
  return { ok: true as const };
}
