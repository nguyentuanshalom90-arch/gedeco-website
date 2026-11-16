"use server";

import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "./auth";
import type { ProductCategoryInput, ProductCategoryListItem } from "./product-category-types";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function canonical(value: string, language: "vi" | "en") {
  const input = value.trim();
  if (!input) return null;
  if (input.startsWith("/")) return input;
  try {
    const url = new URL(input);
    if (url.protocol === "https:" && ["gedeco.vn", "www.gedeco.vn"].includes(url.hostname.toLowerCase())) return input;
  } catch {}
  throw new Error(`Canonical ${language.toUpperCase()} phải là đường dẫn nội bộ hoặc URL HTTPS của gedeco.vn.`);
}

function toItem(row: any): ProductCategoryListItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    nameEn: row.nameEn,
    slugEn: row.slugEn,
    descriptionEn: row.descriptionEn,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    imageCaption: row.imageCaption,
    imageAltEn: row.imageAltEn,
    imageCaptionEn: row.imageCaptionEn,
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    metaTitleEn: row.metaTitleEn ?? "",
    metaDescriptionEn: row.metaDescriptionEn ?? "",
    canonicalUrl: row.canonicalUrl ?? "",
    canonicalUrlEn: row.canonicalUrlEn ?? "",
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
    productCount: row._count?.products ?? 0,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listProductCategories(): Promise<ProductCategoryListItem[]> {
  await requireDashboardSession();
  const rows = await prisma.productCategory.findMany({ include: { _count: { select: { products: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return rows.map(toItem);
}

export async function saveProductCategory(input: ProductCategoryInput) {
  await requireDashboardSession();
  const name = input.name.trim();
  const nameEn = input.nameEn.trim();
  const slug = slugify(input.slug || name);
  const slugEn = slugify(input.slugEn || nameEn);
  if (!name || !nameEn || !slug || !slugEn) throw new Error("Danh mục cần đủ tên và slug tiếng Việt/English.");
  if (input.imageUrl.trim() && (!input.imageAlt.trim() || !input.imageAltEn.trim())) throw new Error("Ảnh danh mục phải có alt text VI và EN.");
  if (input.metaTitle.length > 65 || input.metaTitleEn.length > 65) throw new Error("SEO title không vượt quá 65 ký tự.");
  if (input.metaDescription.length > 160 || input.metaDescriptionEn.length > 160) throw new Error("Meta description không vượt quá 160 ký tự.");
  const duplicate = await prisma.productCategory.findFirst({ where: { OR: [{ slug }, { slugEn }], ...(input.id ? { NOT: { id: input.id } } : {}) }, select: { id: true } });
  if (duplicate) throw new Error("Slug danh mục đã tồn tại.");
  const data = {
    name, slug, nameEn, slugEn,
    description: input.description.trim(), descriptionEn: input.descriptionEn.trim(),
    imageUrl: input.imageUrl.trim(), imageAlt: input.imageAlt.trim(), imageCaption: input.imageCaption.trim(), imageAltEn: input.imageAltEn.trim(), imageCaptionEn: input.imageCaptionEn.trim(),
    metaTitle: input.metaTitle.trim() || null, metaDescription: input.metaDescription.trim() || null,
    metaTitleEn: input.metaTitleEn.trim() || null, metaDescriptionEn: input.metaDescriptionEn.trim() || null,
    canonicalUrl: canonical(input.canonicalUrl, "vi"), canonicalUrlEn: canonical(input.canonicalUrlEn, "en"),
    robotsIndex: input.robotsIndex, robotsFollow: input.robotsFollow, isPublished: input.isPublished,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
  };
  const row = input.id
    ? await prisma.productCategory.update({ where: { id: input.id }, data, include: { _count: { select: { products: true } } } })
    : await prisma.productCategory.create({ data, include: { _count: { select: { products: true } } } });
  return { ok: true as const, category: toItem(row) };
}

export async function deleteProductCategory(id: string) {
  await requireDashboardSession();
  const category = await prisma.productCategory.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!category) return { ok: true as const };
  if (category._count.products > 0) throw new Error(`Không thể xóa: danh mục còn ${category._count.products} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`);
  await prisma.productCategory.delete({ where: { id } });
  return { ok: true as const };
}
