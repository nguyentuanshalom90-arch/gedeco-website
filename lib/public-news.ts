import type { NewsArticle, TranslationEntry } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { optimizedStaticMediaUrl } from "@/lib/static-media";

export function visibleArticleWhere() {
  return {
  OR: [
    { status: "PUBLISHED" as const },
    { status: "SCHEDULED" as const, scheduledAt: { lte: new Date() } },
  ],
  };
}

export type EnglishArticle = {
  source: NewsArticle;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  imageAlt: string;
  imageCaption: string;
  ogImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  tags: string[];
};

function payloadOf(entry: TranslationEntry) {
  return entry.payload && typeof entry.payload === "object" && !Array.isArray(entry.payload)
    ? (entry.payload as Record<string, unknown>)
    : {};
}

function text(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? payload[key].trim() : "";
}

function tags(payload: Record<string, unknown>) {
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

export function toEnglishArticle(source: NewsArticle, entry: TranslationEntry): EnglishArticle | null {
  const payload = payloadOf(entry);
  const title = text(payload, "title");
  const slug = entry.slug?.trim();
  if (!title || !slug) return null;
  return {
    source: { ...source, imageUrl: optimizedStaticMediaUrl(source.imageUrl), ogImageUrl: optimizedStaticMediaUrl(source.ogImageUrl) },
    slug,
    title,
    category: text(payload, "category") || "News",
    excerpt: text(payload, "excerpt"),
    content: text(payload, "content"),
    imageAlt: text(payload, "imageAlt") || title,
    imageCaption: text(payload, "imageCaption"),
    ogImageAlt: text(payload, "ogImageAlt") || text(payload, "imageAlt") || title,
    metaTitle: text(payload, "metaTitle") || title,
    metaDescription: text(payload, "metaDescription") || text(payload, "excerpt"),
    focusKeyword: text(payload, "focusKeyword"),
    canonicalUrl: text(payload, "canonicalUrl"),
    tags: tags(payload),
  };
}

export async function listEnglishArticles(categoryId?: string) {
  const sources = await prisma.newsArticle.findMany({
    where: { ...visibleArticleWhere(), ...(categoryId ? { categoryId } : {}) },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
  if (!sources.length) return [];
  const entries = await prisma.translationEntry.findMany({
    where: {
      entityType: "NEWS_ARTICLE",
      locale: "en",
      status: "TRANSLATED",
      entityId: { in: sources.map((article) => article.id) },
    },
  });
  const byId = new Map(entries.map((entry) => [entry.entityId, entry]));
  return sources.flatMap((source) => {
    const entry = byId.get(source.id);
    const article = entry ? toEnglishArticle(source, entry) : null;
    return article ? [article] : [];
  });
}

export async function getEnglishArticleBySlug(slug: string) {
  const entry = await prisma.translationEntry.findFirst({
    where: { entityType: "NEWS_ARTICLE", locale: "en", status: "TRANSLATED", slug },
  });
  if (!entry) return null;
  const source = await prisma.newsArticle.findFirst({
    where: { id: entry.entityId, ...visibleArticleWhere() },
  });
  return source ? toEnglishArticle(source, entry) : null;
}
