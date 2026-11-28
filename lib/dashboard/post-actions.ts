"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createHash } from "node:crypto";
import type { TranslationEntry } from "@prisma/client";
import { articleImageTokens, safeArticleImageSrc } from "@/app/components/article-content";
import { syncArticleTranslation } from "@/lib/translation-service";
import { recordPermanentRedirect } from "@/lib/url-redirects";
import type { PostInput, PostListItem } from "./post-types";
import { requireDashboardSession } from "./auth";
import { validateOfficialCanonical } from "./canonical-url";
import { validateManagedMediaUrl } from "./media-url";
import { DashboardValidationError, dashboardActionError } from "./action-errors";
import { sanitizeProductHtml } from "@/lib/sanitize-product-html";

function slugify(value: string): string {
  const out = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return out || `bai-viet-${Date.now()}`;
}

type ArticleRow = NonNullable<
  Awaited<ReturnType<typeof prisma.newsArticle.findFirst>>
>;

function translationPayload(translation?: TranslationEntry | null) {
  return translation?.payload && typeof translation.payload === "object" && !Array.isArray(translation.payload)
    ? translation.payload as Record<string, unknown>
    : {};
}

function payloadText(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? payload[key].trim() : "";
}

function payloadTags(payload: Record<string, unknown>) {
  const value = payload.tags;
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

function toListItem(row: ArticleRow, translation?: TranslationEntry | null): PostListItem {
  const payload = translationPayload(translation);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDesc: row.excerpt ?? "",
    content: row.content ?? "",
    coverImage: row.imageUrl,
    coverImageAlt: row.imageAlt ?? "",
    coverImageCaption: row.imageCaption ?? "",
    ogImage: row.ogImageUrl,
    ogImageAlt: row.ogImageAlt ?? "",
    status: row.status,
    categoryName: row.category,
    categoryId: row.categoryId,
    tags: row.tags,
    scheduledAt: row.scheduledAt?.toISOString().slice(0, 16) ?? null,
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    focusKeyword: row.focusKeyword ?? "",
    canonicalUrl: row.canonicalUrl ?? "",
    authorName: row.authorName ?? "",
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
    isFeatured: row.isFeatured,
    translationMode: translation?.manualOverride ? "MANUAL" : "AUTO",
    translationStatus: translation?.status || "PENDING",
    titleEn: payloadText(payload, "title"),
    slugEn: translation?.slug || "",
    shortDescEn: payloadText(payload, "excerpt"),
    contentEn: payloadText(payload, "content"),
    coverImageAltEn: payloadText(payload, "imageAlt"),
    coverImageCaptionEn: payloadText(payload, "imageCaption"),
    ogImageAltEn: payloadText(payload, "ogImageAlt"),
    metaTitleEn: payloadText(payload, "metaTitle"),
    metaDescriptionEn: payloadText(payload, "metaDescription"),
    canonicalUrlEn: payloadText(payload, "canonicalUrl"),
    focusKeywordEn: payloadText(payload, "focusKeyword"),
    tagsEn: payloadTags(payload),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export async function listPosts(): Promise<PostListItem[]> {
  await requireDashboardSession();
  const rows = await prisma.newsArticle.findMany({
    orderBy: { updatedAt: "desc" },
  });
  const translations = await prisma.translationEntry.findMany({ where: { entityType: "NEWS_ARTICLE", locale: "en", entityId: { in: rows.map((row) => row.id) } } });
  const byArticle = new Map(translations.map((translation) => [translation.entityId, translation]));
  return rows.map((row) => toListItem(row, byArticle.get(row.id)));
}

export async function savePost(
  input: PostInput,
  options?: { preserveEnglish?: boolean },
): Promise<{ ok: true; post: PostListItem; translation: { status: string; errorMessage: string | null } } | { ok: false; error: string }> {
  await requireDashboardSession();
  const preserveEnglish = Boolean(options?.preserveEnglish);
  try {
    const title = input.title.trim();
    const shortDesc = sanitizeProductHtml(input.shortDesc);
    const content = sanitizeProductHtml(input.content);
    const shortDescEn = sanitizeProductHtml(input.shortDescEn);
    const contentEn = sanitizeProductHtml(input.contentEn);
    if (!title) throw new DashboardValidationError("Tiêu đề bài viết không được để trống.");
    if (["PUBLISHED", "SCHEDULED"].includes(input.status) && !shortDesc.trim()) throw new DashboardValidationError("Bài xuất bản hoặc lên lịch phải có mô tả ngắn.");
    if (["PUBLISHED", "SCHEDULED"].includes(input.status) && !content.trim()) throw new DashboardValidationError("Bài xuất bản hoặc lên lịch phải có nội dung chi tiết.");
    if (input.coverImage && !input.coverImageAlt.trim()) throw new DashboardValidationError("Ảnh bìa phải có alt text mô tả.");
    if (input.metaTitle.trim().length > 65) throw new DashboardValidationError("Tiêu đề SEO không được vượt quá 65 ký tự.");
    if (input.metaDescription.trim().length > 160) throw new DashboardValidationError("Mô tả SEO không được vượt quá 160 ký tự.");
    const scheduledAt = input.status === "SCHEDULED" && input.scheduledAt ? new Date(input.scheduledAt) : null;
    if (input.status === "SCHEDULED" && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) throw new DashboardValidationError("Thời gian đăng bài không hợp lệ.");
    if (scheduledAt && scheduledAt <= new Date()) throw new DashboardValidationError("Thời gian lên lịch phải ở tương lai.");
    const imageLines = input.content.split(/\r?\n/).filter((line) => line.trim().startsWith("!["));
    const inlineImages = articleImageTokens(input.content);
    if (!/<(?:img|figure)\b/i.test(input.content) && imageLines.length !== inlineImages.length) throw new DashboardValidationError("Ảnh trong nội dung có cú pháp không hợp lệ. Hãy chèn ảnh bằng thư viện media.");
    if (inlineImages.some((image) => !image.alt || !safeArticleImageSrc(image.src))) throw new DashboardValidationError("Ảnh trong nội dung phải có alt text và dùng media nội bộ hoặc domain chính thức.");
    const slug = slugify(input.slug.trim() || title);
    const duplicate = await prisma.newsArticle.findFirst({ where: { slug, ...(input.id ? { NOT: { id: input.id } } : {}) } });
    if (duplicate) throw new DashboardValidationError("Đường dẫn bài viết đã tồn tại.");
    const category = input.categoryId ? await prisma.newsCategory.findUnique({ where: { id: input.categoryId } }) : null;
    if (input.categoryId && !category) throw new DashboardValidationError("Danh mục bài viết không tồn tại.");
    const previous = input.id ? await prisma.newsArticle.findUnique({ where: { id: input.id } }) : null;
    if (input.id && !previous) throw new DashboardValidationError("Bài viết không còn tồn tại. Vui lòng tải lại danh sách.");
    const previousTranslation = input.id ? await prisma.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "NEWS_ARTICLE", entityId: input.id, locale: "en" } } }) : null;
    if (input.translationMode === "MANUAL") {
      if (!input.titleEn.trim()) throw new DashboardValidationError("Bản English phải có tiêu đề.");
      if (["PUBLISHED", "SCHEDULED"].includes(input.status) && (!shortDescEn.trim() || !contentEn.trim())) throw new DashboardValidationError("Bản English của bài xuất bản phải có mô tả ngắn và nội dung.");
      if (input.coverImage && !input.coverImageAltEn.trim()) throw new DashboardValidationError("Bản English phải có alt text cho ảnh bìa.");
      if (input.metaTitleEn.trim().length > 65) throw new DashboardValidationError("English SEO title không được vượt quá 65 ký tự.");
      if (input.metaDescriptionEn.trim().length > 160) throw new DashboardValidationError("English meta description không được vượt quá 160 ký tự.");
      validateOfficialCanonical(input.canonicalUrlEn, { fieldLabel: "Canonical English", pathPrefix: "/en/news/" });
      const englishImageLines = input.contentEn.split(/\r?\n/).filter((line) => line.trim().startsWith("!["));
      const englishInlineImages = articleImageTokens(input.contentEn);
      if ((!/<(?:img|figure)\b/i.test(input.contentEn) && englishImageLines.length !== englishInlineImages.length) || englishInlineImages.some((image) => !image.alt || !safeArticleImageSrc(image.src))) throw new DashboardValidationError("Ảnh trong nội dung English phải có cú pháp hợp lệ, alt text và media an toàn.");
      const slugEn = slugify(input.slugEn.trim() || input.titleEn);
      const duplicateEnglish = await prisma.translationEntry.findFirst({ where: { entityType: "NEWS_ARTICLE", locale: "en", slug: slugEn, ...(input.id ? { NOT: { entityId: input.id } } : {}) } });
      if (duplicateEnglish) throw new DashboardValidationError("English slug của bài viết đã tồn tại.");
    }
    const data = {
    slug,
    title,
    category: category?.name || input.categoryName.trim() || "Tin tức",
    categoryId: category?.id || null,
    excerpt: shortDesc.trim() || null,
    content: content.trim() || null,
    imageUrl: validateManagedMediaUrl(input.coverImage || "", "Ảnh bìa bài viết"),
    imageAlt: input.coverImageAlt.trim() || null,
    imageCaption: input.coverImageCaption.trim() || null,
    ogImageUrl: validateManagedMediaUrl(input.ogImage || input.coverImage || "", "Ảnh Open Graph bài viết"),
    ogImageAlt: input.ogImageAlt.trim() || input.coverImageAlt.trim() || null,
    status: input.status,
    tags: [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))],
    metaTitle: input.metaTitle.trim() || null,
    metaDescription: input.metaDescription.trim() || null,
    focusKeyword: input.focusKeyword.trim() || null,
    canonicalUrl: validateOfficialCanonical(input.canonicalUrl, { fieldLabel: "Canonical bài viết", pathPrefix: "/tin-tuc/" }),
    authorName: input.authorName.trim() || null,
    robotsIndex: input.robotsIndex,
    robotsFollow: input.robotsFollow,
    isFeatured: input.isFeatured,
    scheduledAt,
    publishedAt:
      input.status === "PUBLISHED"
        ? (previous?.publishedAt ?? new Date())
        : null,
    };
    let row: ArticleRow;
    let translation: TranslationEntry;
    if (input.translationMode === "MANUAL") {
      const slugEn = slugify(input.slugEn.trim() || input.titleEn);
      const payload = {
        title: input.titleEn.trim(), category: category?.nameEn || "News", excerpt: shortDescEn.trim(), content: contentEn.trim(),
        imageAlt: input.coverImageAltEn.trim(), imageCaption: input.coverImageCaptionEn.trim(), ogImageAlt: input.ogImageAltEn.trim() || input.coverImageAltEn.trim(),
        metaTitle: input.metaTitleEn.trim() || input.titleEn.trim(), metaDescription: input.metaDescriptionEn.trim() || input.shortDescEn.trim(), focusKeyword: input.focusKeywordEn.trim(),
        canonicalUrl: validateOfficialCanonical(input.canonicalUrlEn, { fieldLabel: "Canonical English", pathPrefix: "/en/news/" }) || "",
        tags: JSON.stringify([...new Set(input.tagsEn.map((tag) => tag.trim()).filter(Boolean))]),
      };
      const saved = await prisma.$transaction(async (tx) => {
        const article = input.id ? await tx.newsArticle.update({ where: { id: input.id }, data }) : await tx.newsArticle.create({ data });
        if (previous && previous.slug !== article.slug) await recordPermanentRedirect(tx, `/tin-tuc/${previous.slug}`, `/tin-tuc/${article.slug}`);
        const sourceHash = createHash("sha256").update(JSON.stringify({ sourceUpdatedAt: article.updatedAt.toISOString(), payload })).digest("hex");
        const manualTranslation = await tx.translationEntry.upsert({
          where: { entityType_entityId_locale: { entityType: "NEWS_ARTICLE", entityId: article.id, locale: "en" } },
          create: { entityType: "NEWS_ARTICLE", entityId: article.id, locale: "en", slug: slugEn, payload, sourceUpdatedAt: article.updatedAt, sourceHash, status: "TRANSLATED", provider: "manual", manualOverride: true, translatedAt: new Date(), reviewedAt: new Date() },
          update: { slug: slugEn, payload, sourceUpdatedAt: article.updatedAt, sourceHash, status: "TRANSLATED", provider: "manual", manualOverride: true, errorMessage: null, translatedAt: new Date(), reviewedAt: new Date() },
        });
        if (previousTranslation?.status === "TRANSLATED" && previousTranslation.slug && previousTranslation.slug !== manualTranslation.slug && manualTranslation.slug) await recordPermanentRedirect(tx, `/en/news/${previousTranslation.slug}`, `/en/news/${manualTranslation.slug}`);
        return { article, manualTranslation };
      });
      row = saved.article;
      translation = saved.manualTranslation;
    } else {
      row = await prisma.$transaction(async (tx) => {
        const article = input.id ? await tx.newsArticle.update({ where: { id: input.id }, data }) : await tx.newsArticle.create({ data });
        if (previous && previous.slug !== article.slug) await recordPermanentRedirect(tx, `/tin-tuc/${previous.slug}`, `/tin-tuc/${article.slug}`);
        return article;
      });
      if (preserveEnglish && previousTranslation?.manualOverride) {
        translation = previousTranslation;
      } else {
        if (previousTranslation?.manualOverride) await prisma.translationEntry.update({ where: { id: previousTranslation.id }, data: { manualOverride: false } });
        translation = await syncArticleTranslation(row);
      }
      if (translation.status === "TRANSLATED" && translation.slug && previousTranslation?.status === "TRANSLATED" && previousTranslation.slug && previousTranslation.slug !== translation.slug) {
        await prisma.$transaction((tx) => recordPermanentRedirect(tx, `/en/news/${previousTranslation.slug}`, `/en/news/${translation.slug}`));
      }
    }
    for (const path of ["/tin-tuc", "/en/news", `/tin-tuc/${row.slug}`, translation.slug ? `/en/news/${translation.slug}` : null, "/sitemap.xml"]) if (path) revalidatePath(path);
    return { ok: true, post: toListItem(row, translation), translation: { status: translation.status, errorMessage: translation.errorMessage } };
  } catch (error) {
    return { ok: false, error: dashboardActionError(error, "Không thể lưu bài viết. Vui lòng kiểm tra dữ liệu và thử lại.") };
  }
}

export async function deletePost(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireDashboardSession();
  try {
    const removed = await prisma.$transaction(async (tx) => {
      const article = await tx.newsArticle.findUnique({ where: { id } });
      if (!article) throw new DashboardValidationError("Bài viết không còn tồn tại.");
      const translation = await tx.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "NEWS_ARTICLE", entityId: id, locale: "en" } } });
      const destinations = [`/tin-tuc/${article.slug}`, ...(translation?.slug ? [`/en/news/${translation.slug}`] : [])];
      await tx.urlRedirect.deleteMany({ where: { OR: [{ destinationPath: { in: destinations } }, { sourcePath: { in: destinations } }] } });
      await tx.translationEntry.deleteMany({ where: { entityType: "NEWS_ARTICLE", entityId: id } });
      await tx.newsArticle.delete({ where: { id } });
      return { vi: `/tin-tuc/${article.slug}`, en: translation?.slug ? `/en/news/${translation.slug}` : null };
    });
    for (const path of ["/tin-tuc", "/en/news", removed.vi, removed.en, "/sitemap.xml"]) if (path) revalidatePath(path);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: dashboardActionError(error, "Không thể xóa bài viết. Vui lòng thử lại.") };
  }
}
