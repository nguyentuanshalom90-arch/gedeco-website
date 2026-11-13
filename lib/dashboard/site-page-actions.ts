"use server";

import { prisma } from "@/lib/prisma";
import { syncSitePageTranslation } from "@/lib/translation-service";

function assertDashboardWriteAllowed() {
  if (process.env.NODE_ENV === "production") throw new Error("Chưa cấu hình xác thực quản trị cho môi trường production.");
}

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
};

export async function listSitePages() {
  return prisma.sitePage.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, slug: true, name: true, title: true, status: true, updatedAt: true } });
}

export async function saveSitePage(input: SitePageInput) {
  assertDashboardWriteAllowed();
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug || !input.name.trim() || !input.title.trim()) throw new Error("Slug, tên page và tiêu đề là bắt buộc.");
  if (!input.metaTitle.trim() || input.metaTitle.trim().length > 60) throw new Error("SEO title bắt buộc và không vượt quá 60 ký tự.");
  if (!input.metaDescription.trim() || input.metaDescription.trim().length > 160) throw new Error("Meta description bắt buộc và không vượt quá 160 ký tự.");
  if (!Array.isArray(input.sections) || input.sections.length === 0) throw new Error("Page phải có ít nhất một section.");
  const row = input.id
    ? await prisma.sitePage.update({ where: { id: input.id }, data: { slug, name: input.name.trim(), title: input.title.trim(), excerpt: input.excerpt?.trim() || null, sections: input.sections as object, metaTitle: input.metaTitle.trim(), metaDescription: input.metaDescription.trim(), canonicalUrl: input.canonicalUrl?.trim() || `/pages/${slug}`, robotsIndex: input.robotsIndex, robotsFollow: input.robotsFollow, status: input.status } })
    : await prisma.sitePage.create({ data: { slug, name: input.name.trim(), title: input.title.trim(), excerpt: input.excerpt?.trim() || null, sections: input.sections as object, metaTitle: input.metaTitle.trim(), metaDescription: input.metaDescription.trim(), canonicalUrl: input.canonicalUrl?.trim() || `/pages/${slug}`, robotsIndex: input.robotsIndex, robotsFollow: input.robotsFollow, status: input.status } });
  const translation = await syncSitePageTranslation(row);
  return { ok: true as const, page: row, translation: { status: translation.status, errorMessage: translation.errorMessage } };
}
