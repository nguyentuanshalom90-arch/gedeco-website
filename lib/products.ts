import { prisma } from "@/lib/prisma";
import type { GedecoProductDetail } from "@/app/data/product-details";
import { englishProductTranslations } from "@/app/data/product-translations-en";

export function toProductDetail(row: {
  slug: string; title: string; category: { name: string; slug: string; nameEn: string; slugEn: string };
  description: string; contentHtml: string; summaryHtml: string;
  priceText: string; stockText: string; imageUrl: string; shipperImageUrl: string;
  imageAlt: string; imageCaption: string; ogImageUrl: string; ogImageAlt: string;
  metaTitle: string | null; metaDescription: string | null; canonicalUrl: string | null;
  robotsIndex: boolean; robotsFollow: boolean;
  gallery: Array<{ url: string; altText: string; caption: string; sortOrder: number }>;
}): GedecoProductDetail {
  const galleryMedia = row.gallery.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => ({ url: item.url, altText: item.altText, caption: item.caption }));
  return {
    slug: row.slug,
    title: row.title,
    category: row.category.name,
    categorySlug: row.category.slug,
    categorySlugEn: row.category.slugEn,
    image: row.imageUrl,
    imageAlt: row.imageAlt || row.title,
    imageCaption: row.imageCaption,
    description: row.description,
    contentHtml: row.contentHtml,
    gallery: galleryMedia.map((item) => item.url),
    galleryMedia,
    summaryHtml: row.summaryHtml,
    priceText: row.priceText,
    stockText: row.stockText,
    shipperImage: row.shipperImageUrl,
    ogImage: row.ogImageUrl || row.imageUrl,
    ogImageAlt: row.ogImageAlt || row.imageAlt || row.title,
    metaTitle: row.metaTitle || row.title,
    metaDescription: row.metaDescription || row.description,
    canonicalUrl: undefined,
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
  };
}

export async function listProducts() {
  const rows = await prisma.product.findMany({
    where: { isPublished: true, category: { isPublished: true } },
    include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(toProductDetail);
}

export async function listAllProducts() {
  return prisma.product.findMany({
    include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getProductCategoryBySlug(slug: string, language: "vi" | "en" = "vi") {
  return prisma.productCategory.findFirst({
    where: { isPublished: true, ...(language === "en" ? { slugEn: slug } : { slug }) },
  });
}

export async function getProductBySlug(slug: string) {
  let row = await prisma.product.findFirst({
    where: { slug, isPublished: true, category: { isPublished: true } },
    include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } },
  });
  if (!row) {
    const englishEntry = Object.values(englishProductTranslations).find((item) => item.slug === slug);
    if (englishEntry) {
      row = await prisma.product.findFirst({
        where: { slug: englishEntry.sourceSlug, isPublished: true, category: { isPublished: true } },
        include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } },
      });
    }
  }
  return row && toProductDetail(row);
}

type EnglishProductView = Omit<GedecoProductDetail, "category"> & { category: string; sourceSlug: string; translationStatus: string };

function englishFallback(sourceSlug: string) {
  return Object.values(englishProductTranslations).find((item) => item.sourceSlug === sourceSlug);
}

function payloadString(payload: unknown, key: string, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function hasEnglishPayload(entry: any) {
  return Boolean(entry?.slug && payloadString(entry.payload, "title", ""));
}

function toEnglishView(row: any, entry?: any): EnglishProductView {
  const fallback = englishFallback(row.slug);
  const payload = entry?.payload;
  return {
    slug: entry?.slug || fallback?.slug || row.slug,
    sourceSlug: row.slug,
    title: payloadString(payload, "title", fallback?.title || row.title),
    category: row.category.nameEn,
    categorySlug: row.category.slug,
    categorySlugEn: row.category.slugEn,
    image: row.imageUrl,
    imageAlt: payloadString(payload, "imageAlt", row.imageAlt || payloadString(payload, "title", fallback?.title || row.title)),
    imageCaption: payloadString(payload, "imageCaption", row.imageCaption || ""),
    description: payloadString(payload, "description", fallback?.description || row.description),
    contentHtml: payloadString(payload, "contentHtml", fallback?.contentHtml || row.contentHtml),
    gallery: row.gallery.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((item: any) => item.url),
    galleryMedia: row.gallery.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((item: any) => ({ url: item.url, altText: payloadString(payload, `galleryAlt_${item.id}`, item.altText), caption: payloadString(payload, `galleryCaption_${item.id}`, item.caption) })),
    summaryHtml: payloadString(payload, "summaryHtml", fallback?.summaryHtml || row.summaryHtml),
    priceText: payloadString(payload, "priceText", fallback?.priceText || row.priceText),
    stockText: payloadString(payload, "stockText", fallback?.stockText || row.stockText),
    shipperImage: row.shipperImageUrl,
    ogImage: row.ogImageUrl || row.imageUrl,
    ogImageAlt: payloadString(payload, "ogImageAlt", row.ogImageAlt || row.imageAlt || row.title),
    metaTitle: payloadString(payload, "metaTitle", row.metaTitle || fallback?.title || row.title),
    metaDescription: payloadString(payload, "metaDescription", row.metaDescription || fallback?.description || row.description),
    canonicalUrl: row.canonicalUrl || undefined,
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
    translationStatus: entry?.status || (fallback ? "TRANSLATED" : "PENDING"),
  };
}

export async function listEnglishProducts() {
  const rows = await prisma.product.findMany({ where: { isPublished: true, category: { isPublished: true } }, include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  const entries = await prisma.translationEntry.findMany({ where: { entityType: "PRODUCT", locale: "en", status: { in: ["TRANSLATED", "NEEDS_REVIEW", "FAILED"] }, entityId: { in: rows.map((row) => row.id) } } });
  const byId = new Map(entries.map((entry) => [entry.entityId, entry]));
  return rows.flatMap((row) => {
    const entry = byId.get(row.id);
    if (!hasEnglishPayload(entry) && !englishFallback(row.slug)) return [];
    return [toEnglishView(row, hasEnglishPayload(entry) ? entry : undefined)];
  });
}

export async function getEnglishProductBySlug(slug: string) {
  const entry = await prisma.translationEntry.findFirst({ where: { entityType: "PRODUCT", locale: "en", status: { in: ["TRANSLATED", "NEEDS_REVIEW", "FAILED"] }, slug } });
  if (entry && hasEnglishPayload(entry)) {
    const source = await prisma.product.findFirst({ where: { id: entry.entityId, isPublished: true, category: { isPublished: true } }, include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } } });
    return source ? { view: toEnglishView(source, entry), source: toProductDetail(source), sourceSlug: source.slug, canonicalSlug: entry.slug! } : null;
  }
  const fallback = Object.values(englishProductTranslations).find((item) => item.slug === slug);
  if (!fallback) return null;
  const source = await prisma.product.findFirst({ where: { slug: fallback.sourceSlug, isPublished: true, category: { isPublished: true } }, include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } } });
  return source ? { view: toEnglishView(source), source: toProductDetail(source), sourceSlug: source.slug, canonicalSlug: fallback.slug } : null;
}
