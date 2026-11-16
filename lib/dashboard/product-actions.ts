"use server";

import { prisma } from "@/lib/prisma";
import { syncProductTranslation } from "@/lib/translation-service";
import { requireDashboardSession } from "./auth";
import type { ProductInput, ProductListItem } from "./product-types";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function optional(value: string) {
  return value.trim() || null;
}

function validateCanonical(value: string) {
  const canonical = value.trim();
  if (!canonical) return null;
  if (canonical.startsWith("/")) return canonical;
  try {
    const url = new URL(canonical);
    if (url.protocol === "https:" && ["gedeco.vn", "www.gedeco.vn"].includes(url.hostname.toLowerCase())) return canonical;
  } catch {}
  throw new Error("Canonical phải là đường dẫn nội bộ hoặc URL HTTPS của gedeco.vn.");
}

function toItem(row: any): ProductListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    contentHtml: row.contentHtml,
    summaryHtml: row.summaryHtml,
    priceText: row.priceText,
    stockText: row.stockText,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    imageCaption: row.imageCaption,
    shipperImageUrl: row.shipperImageUrl,
    ogImageUrl: row.ogImageUrl,
    ogImageAlt: row.ogImageAlt,
    gallery: row.gallery.map((item: any) => ({ id: item.id, url: item.url, altText: item.altText, caption: item.caption, sortOrder: item.sortOrder, isPrimary: item.isPrimary })),
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    canonicalUrl: row.canonicalUrl ?? "",
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listDashboardProducts() {
  await requireDashboardSession();
  const rows = await prisma.product.findMany({ include: { gallery: { orderBy: { sortOrder: "asc" } } }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  return rows.map(toItem);
}

export async function saveProduct(input: ProductInput) {
  await requireDashboardSession();
  const title = input.title.trim();
  if (!title) throw new Error("Tên sản phẩm không được để trống.");
  const slug = slugify(input.slug || title);
  if (!slug) throw new Error("Slug sản phẩm không hợp lệ.");
  if (input.imageUrl.trim() && !input.imageAlt.trim()) throw new Error("Ảnh chính phải có alt text.");
  if (input.metaTitle.trim().length > 65) throw new Error("SEO title không vượt quá 65 ký tự.");
  if (input.metaDescription.trim().length > 160) throw new Error("Meta description không vượt quá 160 ký tự.");
  const gallery = input.gallery.filter((item) => item.url.trim()).map((item, index) => ({
    url: item.url.trim(),
    altText: item.altText.trim() || title,
    caption: item.caption.trim(),
    sortOrder: index,
    isPrimary: index === 0,
  }));
  const duplicate = await prisma.product.findFirst({ where: { slug, ...(input.id ? { NOT: { id: input.id } } : {}) }, select: { id: true } });
  if (duplicate) throw new Error("Slug sản phẩm đã tồn tại.");
  const data = {
    slug,
    title,
    category: input.category,
    description: input.description.trim(),
    contentHtml: input.contentHtml,
    summaryHtml: input.summaryHtml,
    priceText: input.priceText.trim() || "Liên hệ",
    stockText: input.stockText.trim() || "Còn hàng",
    imageUrl: input.imageUrl.trim(),
    imageAlt: input.imageAlt.trim(),
    imageCaption: input.imageCaption.trim(),
    shipperImageUrl: input.shipperImageUrl.trim(),
    ogImageUrl: input.ogImageUrl.trim(),
    ogImageAlt: input.ogImageAlt.trim(),
    metaTitle: optional(input.metaTitle),
    metaDescription: optional(input.metaDescription),
    canonicalUrl: validateCanonical(input.canonicalUrl),
    robotsIndex: input.robotsIndex,
    robotsFollow: input.robotsFollow,
    isPublished: input.isPublished,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
  };
  const fresh = await prisma.$transaction(async (tx) => {
    const row = input.id
      ? await tx.product.update({ where: { id: input.id }, data })
      : await tx.product.create({ data });
    await tx.productMedia.deleteMany({ where: { productId: row.id } });
    if (gallery.length) await tx.productMedia.createMany({ data: gallery.map((item) => ({ productId: row.id, ...item })) });
    return tx.product.findUniqueOrThrow({ where: { id: row.id }, include: { gallery: { orderBy: { sortOrder: "asc" } } } });
  });
  const translation = await syncProductTranslation(fresh);
  return { ok: true as const, product: toItem(fresh), translation: { status: translation.status, errorMessage: translation.errorMessage } };
}

export async function deleteProduct(id: string) {
  await requireDashboardSession();
  await prisma.product.delete({ where: { id } });
  return { ok: true as const };
}
