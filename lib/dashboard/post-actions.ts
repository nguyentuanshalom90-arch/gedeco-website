"use server";

import { prisma } from "@/lib/prisma";
import { syncArticleTranslation } from "@/lib/translation-service";
import type { PostInput, PostListItem } from "./post-types";
import { requireDashboardSession } from "./auth";

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

function toListItem(row: ArticleRow): PostListItem {
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
  return rows.map(toListItem);
}

export async function savePost(
  input: PostInput,
): Promise<{ ok: true; post: PostListItem; translation: { status: string; errorMessage: string | null } }> {
  await requireDashboardSession();
  const title = input.title.trim();
  if (!title) throw new Error("Tiêu đề bài viết không được để trống.");
  if (input.status === "SCHEDULED" && !input.scheduledAt)
    throw new Error("Vui lòng chọn thời gian đăng bài.");
  const slug = slugify(input.slug.trim() || title);
  const duplicate = await prisma.newsArticle.findFirst({
    where: { slug, ...(input.id ? { NOT: { id: input.id } } : {}) },
  });
  if (duplicate) throw new Error("Đường dẫn bài viết đã tồn tại.");
  const category = input.categoryId
    ? await prisma.newsCategory.findUnique({ where: { id: input.categoryId } })
    : null;
  if (input.categoryId && !category)
    throw new Error("Danh mục bài viết không tồn tại.");
  const previous = input.id
    ? await prisma.newsArticle.findUnique({ where: { id: input.id } })
    : null;
  const data = {
    slug,
    title,
    category: category?.name || input.categoryName.trim() || "Tin tức",
    categoryId: category?.id || null,
    excerpt: input.shortDesc.trim() || null,
    content: input.content.trim() || null,
    imageUrl: input.coverImage || null,
    imageAlt: input.coverImageAlt.trim() || null,
    imageCaption: input.coverImageCaption.trim() || null,
    ogImageUrl: input.ogImage || input.coverImage || null,
    ogImageAlt: input.ogImageAlt.trim() || input.coverImageAlt.trim() || null,
    status: input.status,
    tags: [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))],
    metaTitle: input.metaTitle.trim() || null,
    metaDescription: input.metaDescription.trim() || null,
    focusKeyword: input.focusKeyword.trim() || null,
    canonicalUrl: input.canonicalUrl.trim() || null,
    authorName: input.authorName.trim() || null,
    robotsIndex: input.robotsIndex,
    robotsFollow: input.robotsFollow,
    isFeatured: input.isFeatured,
    scheduledAt:
      input.status === "SCHEDULED"
        ? new Date(input.scheduledAt as string)
        : null,
    publishedAt:
      input.status === "PUBLISHED"
        ? (previous?.publishedAt ?? new Date())
        : null,
  };
  const row = input.id
    ? await prisma.newsArticle.update({ where: { id: input.id }, data })
    : await prisma.newsArticle.create({ data });
  const translation = await syncArticleTranslation(row);
  return { ok: true, post: toListItem(row), translation: { status: translation.status, errorMessage: translation.errorMessage } };
}

export async function deletePost(id: string): Promise<{ ok: true }> {
  await requireDashboardSession();
  await prisma.newsArticle.delete({ where: { id } });
  return { ok: true };
}
