import { prisma } from "@/lib/prisma";
import type { GedecoProductDetail } from "@/app/data/product-details";
import { englishProductTranslations } from "@/app/data/product-translations-en";

export function categoryLabel(category: "DOMESTIC" | "EXPORT") {
  return category === "EXPORT" ? "Sản phẩm xuất khẩu" : "Sản phẩm trong nước";
}

export function categorySlug(category: "DOMESTIC" | "EXPORT") {
  return category === "EXPORT" ? "xuat-khau" : "trong-nuoc";
}

export function toProductDetail(row: {
  slug: string; title: string; category: "DOMESTIC" | "EXPORT";
  description: string; contentHtml: string; summaryHtml: string;
  priceText: string; stockText: string; imageUrl: string; shipperImageUrl: string;
  gallery: Array<{ url: string; sortOrder: number }>;
}): GedecoProductDetail {
  const gallery = row.gallery.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => item.url);
  return {
    slug: row.slug,
    title: row.title,
    category: categoryLabel(row.category),
    image: row.imageUrl,
    description: row.description,
    contentHtml: row.contentHtml,
    gallery,
    summaryHtml: row.summaryHtml,
    priceText: row.priceText,
    stockText: row.stockText,
    shipperImage: row.shipperImageUrl,
  };
}

export async function listProducts() {
  const rows = await prisma.product.findMany({
    where: { isPublished: true },
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(toProductDetail);
}

export async function listAllProducts() {
  return prisma.product.findMany({
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getProductBySlug(slug: string) {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
  });
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

function toEnglishView(row: any, entry?: any): EnglishProductView {
  const fallback = englishFallback(row.slug);
  const payload = entry?.payload;
  return {
    slug: entry?.slug || fallback?.slug || row.slug,
    sourceSlug: row.slug,
    title: payloadString(payload, "title", fallback?.title || row.title),
    category: row.category === "EXPORT" ? "Export products" : "Domestic products",
    image: row.imageUrl,
    description: payloadString(payload, "description", fallback?.description || row.description),
    contentHtml: payloadString(payload, "contentHtml", fallback?.contentHtml || row.contentHtml),
    gallery: row.gallery.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((item: any) => item.url),
    summaryHtml: payloadString(payload, "summaryHtml", fallback?.summaryHtml || row.summaryHtml),
    priceText: payloadString(payload, "priceText", fallback?.priceText || row.priceText),
    stockText: payloadString(payload, "stockText", fallback?.stockText || row.stockText),
    shipperImage: row.shipperImageUrl,
    translationStatus: entry?.status || (fallback ? "TRANSLATED" : "PENDING"),
  };
}

export async function listEnglishProducts() {
  const rows = await prisma.product.findMany({ where: { isPublished: true }, include: { gallery: { orderBy: { sortOrder: "asc" } } }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  const entries = await prisma.translationEntry.findMany({ where: { entityType: "PRODUCT", locale: "en", entityId: { in: rows.map((row) => row.id) } } });
  const byId = new Map(entries.map((entry) => [entry.entityId, entry]));
  return rows.map((row) => toEnglishView(row, byId.get(row.id)));
}

export async function getEnglishProductBySlug(slug: string) {
  const entry = await prisma.translationEntry.findFirst({ where: { entityType: "PRODUCT", locale: "en", slug } });
  const source = entry ? await prisma.product.findUnique({ where: { id: entry.entityId }, include: { gallery: { orderBy: { sortOrder: "asc" } } } }) : await prisma.product.findUnique({ where: { slug }, include: { gallery: { orderBy: { sortOrder: "asc" } } } });
  if (!source) {
    const fallback = Object.values(englishProductTranslations).find((item) => item.slug === slug);
    if (!fallback) return null;
    const sourceRow = await prisma.product.findUnique({ where: { slug: fallback.sourceSlug }, include: { gallery: { orderBy: { sortOrder: "asc" } } } });
    return sourceRow ? { view: toEnglishView(sourceRow), source: toProductDetail(sourceRow), sourceSlug: sourceRow.slug, canonicalSlug: fallback.slug } : null;
  }
  return { view: toEnglishView(source, entry || undefined), source: toProductDetail(source), sourceSlug: source.slug, canonicalSlug: entry?.slug || englishFallback(source.slug)?.slug || source.slug };
}
