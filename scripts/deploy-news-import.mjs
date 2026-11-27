import fs from "node:fs";
import { prisma } from "./prisma-client.mjs";

const input = process.argv[2] || "news-export.json";
const source = JSON.parse(fs.readFileSync(input, "utf8"));
const categoryIds = new Map();
const articleIds = new Map();

for (const category of source.categories || []) {
  const data = {
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    nameEn: category.nameEn ?? null,
    slugEn: category.slugEn ?? null,
    descriptionEn: category.descriptionEn ?? null,
    metaTitle: category.metaTitle ?? null,
    metaDescription: category.metaDescription ?? null,
    metaTitleEn: category.metaTitleEn ?? null,
    metaDescriptionEn: category.metaDescriptionEn ?? null,
    canonicalUrl: category.canonicalUrl ?? null,
    canonicalUrlEn: category.canonicalUrlEn ?? null,
    robotsIndex: Boolean(category.robotsIndex),
    robotsFollow: Boolean(category.robotsFollow),
    sortOrder: Number(category.sortOrder) || 0,
  };
  const saved = await prisma.newsCategory.upsert({ where: { slug: category.slug }, create: data, update: data, select: { id: true } });
  categoryIds.set(category.id, saved.id);
}

for (const article of source.articles || []) {
  const data = {
    slug: article.slug,
    title: article.title,
    category: article.category,
    categoryId: article.categoryId ? (categoryIds.get(article.categoryId) || null) : null,
    excerpt: article.excerpt ?? null,
    content: article.content ?? null,
    imageUrl: article.imageUrl ?? null,
    imageAlt: article.imageAlt ?? null,
    imageCaption: article.imageCaption ?? null,
    ogImageUrl: article.ogImageUrl ?? null,
    ogImageAlt: article.ogImageAlt ?? null,
    status: article.status,
    tags: Array.isArray(article.tags) ? article.tags : [],
    metaTitle: article.metaTitle ?? null,
    metaDescription: article.metaDescription ?? null,
    focusKeyword: article.focusKeyword ?? null,
    canonicalUrl: article.canonicalUrl ?? null,
    authorName: article.authorName ?? null,
    robotsIndex: Boolean(article.robotsIndex),
    robotsFollow: Boolean(article.robotsFollow),
    isFeatured: Boolean(article.isFeatured),
    scheduledAt: article.scheduledAt ? new Date(article.scheduledAt) : null,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
  };
  const saved = await prisma.newsArticle.upsert({ where: { slug: article.slug }, create: data, update: data, select: { id: true } });
  articleIds.set(article.id, saved.id);
}

for (const translation of source.translations || []) {
  const entityId = articleIds.get(translation.entityId);
  if (!entityId) continue;
  const data = {
    slug: translation.slug ?? null,
    payload: translation.payload,
    sourceUpdatedAt: new Date(translation.sourceUpdatedAt),
    sourceHash: translation.sourceHash,
    status: translation.status,
    provider: translation.provider ?? null,
    errorMessage: translation.errorMessage ?? null,
    manualOverride: Boolean(translation.manualOverride),
    translatedAt: translation.translatedAt ? new Date(translation.translatedAt) : null,
    reviewedAt: translation.reviewedAt ? new Date(translation.reviewedAt) : null,
  };
  await prisma.translationEntry.upsert({ where: { entityType_entityId_locale: { entityType: "NEWS_ARTICLE", entityId, locale: "en" } }, create: { entityType: "NEWS_ARTICLE", entityId, locale: "en", ...data }, update: data });
}

console.log(JSON.stringify({ importedCategories: categoryIds.size, importedArticles: articleIds.size, importedTranslations: (source.translations || []).filter((item) => articleIds.has(item.entityId)).length }));
await prisma["$disconnect"]();
