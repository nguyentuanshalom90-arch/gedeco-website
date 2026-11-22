import { prisma } from "@/lib/prisma";
import type { GedecoProductDetail } from "@/app/data/product-details";
import { sanitizeProductHtml } from "@/lib/sanitize-product-html";
import { optimizedStaticMediaUrl } from "@/lib/static-media";

export function toProductDetail(row: {
  slug: string; title: string; titleHtml: string; titleColor: string; titleFontFamily: string; titleFontSize: number; titleFontWeight: number; category: { name: string; slug: string; nameEn: string; slugEn: string };
  description: string; contentHtml: string; summaryHtml: string;
  priceText: string; stockText: string; imageUrl: string; shipperImageUrl: string;
  shipperImageAlt: string; shipperImageCaption: string;
  imageAlt: string; imageCaption: string; ogImageUrl: string; ogImageAlt: string;
  metaTitle: string | null; metaDescription: string | null; canonicalUrl: string | null;
  robotsIndex: boolean; robotsFollow: boolean;
  gallery: Array<{ url: string; altText: string; caption: string; sortOrder: number }>;
}): GedecoProductDetail {
  const galleryMedia = row.gallery.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => ({ url: optimizedStaticMediaUrl(item.url), altText: item.altText, caption: "" }));
  return {
    slug: row.slug,
    title: row.title,
    titleHtml: sanitizeProductHtml(row.titleHtml || `<p>${row.title}</p>`),
    titleColor: row.titleColor,
    titleFontFamily: "Arial",
    titleFontSize: 28,
    titleFontWeight: 700,
    category: row.category.name,
    categorySlug: row.category.slug,
    categorySlugEn: row.category.slugEn,
    image: optimizedStaticMediaUrl(row.imageUrl),
    imageAlt: row.imageAlt || row.title,
    imageCaption: "",
    description: sanitizeProductHtml(row.description),
    contentHtml: sanitizeProductHtml(row.contentHtml),
    gallery: galleryMedia.map((item) => item.url),
    galleryMedia,
    summaryHtml: sanitizeProductHtml(row.summaryHtml),
    priceText: row.priceText,
    stockText: row.stockText,
    shipperImage: optimizedStaticMediaUrl(row.shipperImageUrl),
    shipperImageAlt: row.shipperImageAlt || row.title,
    shipperImageCaption: "",
    ogImage: optimizedStaticMediaUrl(row.ogImageUrl || row.imageUrl),
    ogImageAlt: row.ogImageAlt || row.imageAlt || row.title,
    metaTitle: row.metaTitle || row.title,
    metaDescription: row.metaDescription || row.description,
    canonicalUrl: row.canonicalUrl || undefined,
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
  const category = await prisma.productCategory.findFirst({
    where: { isPublished: true, ...(language === "en" ? { slugEn: slug } : { slug }) },
  });
  return category ? { ...category, imageUrl: optimizedStaticMediaUrl(category.imageUrl) } : null;
}

export async function getProductBySlug(slug: string) {
  const row = await prisma.product.findFirst({
    where: { slug, isPublished: true, category: { isPublished: true } },
    include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } },
  });
  return row && toProductDetail(row);
}

export async function getEnglishProductAlternateBySourceSlug(slug: string) {
  const product = await prisma.product.findFirst({ where: { slug, isPublished: true, category: { isPublished: true } }, select: { id: true, category: { select: { slugEn: true } } } });
  if (!product) return null;
  const translation = await prisma.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: product.id, locale: "en" } }, select: { slug: true, status: true, payload: true } });
  if (!hasEnglishPayload(translation)) return null;
  return `/en/products/${product.category.slugEn}/${translation!.slug}`;
}

type EnglishProductView = Omit<GedecoProductDetail, "category"> & { category: string; sourceSlug: string; translationStatus: string };

function payloadString(payload: unknown, key: string, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function hasEnglishPayload(entry: any) {
  return Boolean(entry?.status === "TRANSLATED" && entry?.slug && payloadString(entry.payload, "title", ""));
}

function toEnglishView(row: any, entry?: any): EnglishProductView {
  const payload = entry?.payload;
  return {
    slug: entry?.slug || row.slug,
    sourceSlug: row.slug,
    title: payloadString(payload, "title", row.title),
    // English title is stored as plain text in the translation payload. Never
    // render the Vietnamese title HTML on the English route.
    titleHtml: sanitizeProductHtml(`<p><strong>${payloadString(payload, "title", row.title)}</strong></p>`),
    titleColor: row.titleColor,
    titleFontFamily: "Arial",
    titleFontSize: 28,
    titleFontWeight: 700,
    category: row.category.nameEn,
    categorySlug: row.category.slug,
    categorySlugEn: row.category.slugEn,
    image: optimizedStaticMediaUrl(row.imageUrl),
    imageAlt: payloadString(payload, "imageAlt", row.imageAlt || payloadString(payload, "title", row.title)),
    imageCaption: "",
    description: sanitizeProductHtml(payloadString(payload, "description", row.description)),
    contentHtml: sanitizeProductHtml(payloadString(payload, "contentHtml", row.contentHtml)),
    gallery: row.gallery.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((item: any) => optimizedStaticMediaUrl(item.url)),
    galleryMedia: row.gallery.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((item: any) => ({ url: optimizedStaticMediaUrl(item.url), altText: payloadString(payload, `galleryAlt_${item.id}`, item.altText), caption: "" })),
    // A product's short introduction is stored in `description`. Do not fall
    // back to the Vietnamese source `summaryHtml` when the English summary is
    // empty; use the already translated English description instead.
    summaryHtml: sanitizeProductHtml(payloadString(payload, "summaryHtml", payloadString(payload, "description", ""))),
    priceText: payloadString(payload, "priceText", row.priceText),
    stockText: payloadString(payload, "stockText", row.stockText),
    shipperImage: optimizedStaticMediaUrl(row.shipperImageUrl),
    shipperImageAlt: payloadString(payload, "shipperImageAlt", row.shipperImageAlt || payloadString(payload, "title", row.title)),
    shipperImageCaption: "",
    ogImage: optimizedStaticMediaUrl(row.ogImageUrl || row.imageUrl),
    ogImageAlt: payloadString(payload, "ogImageAlt", row.ogImageAlt || row.imageAlt || row.title),
    metaTitle: payloadString(payload, "metaTitle", row.metaTitle || row.title),
    metaDescription: payloadString(payload, "metaDescription", row.metaDescription || row.description),
    canonicalUrl: payloadString(payload, "canonicalUrl", "") || undefined,
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
    translationStatus: entry?.status || "PENDING",
  };
}

export async function listEnglishProducts() {
  const rows = await prisma.product.findMany({ where: { isPublished: true, category: { isPublished: true } }, include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  const entries = await prisma.translationEntry.findMany({ where: { entityType: "PRODUCT", locale: "en", status: "TRANSLATED", entityId: { in: rows.map((row) => row.id) } } });
  const byId = new Map(entries.map((entry) => [entry.entityId, entry]));
  return rows.flatMap((row) => {
    const entry = byId.get(row.id);
    if (!hasEnglishPayload(entry)) return [];
    return [toEnglishView(row, entry)];
  });
}

export async function getEnglishProductBySlug(slug: string) {
  const entry = await prisma.translationEntry.findFirst({ where: { entityType: "PRODUCT", locale: "en", status: "TRANSLATED", slug } });
  if (entry && hasEnglishPayload(entry)) {
    const source = await prisma.product.findFirst({ where: { id: entry.entityId, isPublished: true, category: { isPublished: true } }, include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } } });
    return source ? { view: toEnglishView(source, entry), source: toProductDetail(source), sourceSlug: source.slug, canonicalSlug: entry.slug! } : null;
  }
  return null;
}
