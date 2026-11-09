import { prisma } from "@/lib/prisma";
import type { GedecoProductDetail } from "@/app/data/product-details";

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
