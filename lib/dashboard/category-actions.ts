"use server";

import { prisma } from "@/lib/prisma";
import type { CategoryInput, CategoryListItem } from "./category-types";
import { requireDashboardSession } from "./auth";

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return slug || `danh-muc-${Date.now()}`;
}

type CategoryRow = Awaited<
  ReturnType<typeof prisma.newsCategory.findMany>
>[number] & { _count?: { articles: number } };
function toItem(row: CategoryRow): CategoryListItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    nameEn: row.nameEn ?? "",
    slugEn: row.slugEn ?? "",
    descriptionEn: row.descriptionEn ?? "",
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    metaTitleEn: row.metaTitleEn ?? "",
    metaDescriptionEn: row.metaDescriptionEn ?? "",
    canonicalUrl: row.canonicalUrl ?? "",
    canonicalUrlEn: row.canonicalUrlEn ?? "",
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
    sortOrder: row.sortOrder,
    articleCount: row._count?.articles ?? 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listCategories(): Promise<CategoryListItem[]> {
  await requireDashboardSession();
  const rows = await prisma.newsCategory.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(toItem);
}

export async function saveCategory(
  input: CategoryInput,
): Promise<{ ok: true; category: CategoryListItem }> {
  await requireDashboardSession();
  const name = input.name.trim();
  if (!name) throw new Error("Tên danh mục không được để trống.");
  const slug = slugify(input.slug || name);
  const slugEn = input.slugEn.trim() ? slugify(input.slugEn) : null;
  const duplicate = await prisma.newsCategory.findFirst({
    where: {
      OR: [{ slug }, ...(slugEn ? [{ slugEn }] : [])],
      ...(input.id ? { NOT: { id: input.id } } : {}),
    },
  });
  if (duplicate) throw new Error("Đường dẫn danh mục đã tồn tại.");
  const data = {
    name,
    slug,
    description: input.description.trim() || null,
    nameEn: input.nameEn.trim() || null,
    slugEn,
    descriptionEn: input.descriptionEn.trim() || null,
    metaTitle: input.metaTitle.trim() || null,
    metaDescription: input.metaDescription.trim() || null,
    metaTitleEn: input.metaTitleEn.trim() || null,
    metaDescriptionEn: input.metaDescriptionEn.trim() || null,
    canonicalUrl: input.canonicalUrl.trim() || null,
    canonicalUrlEn: input.canonicalUrlEn.trim() || null,
    robotsIndex: input.robotsIndex,
    robotsFollow: input.robotsFollow,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
  };
  const row = input.id
    ? await prisma.newsCategory.update({
        where: { id: input.id },
        data,
        include: { _count: { select: { articles: true } } },
      })
    : await prisma.newsCategory.create({
        data,
        include: { _count: { select: { articles: true } } },
      });
  return { ok: true, category: toItem(row) };
}

export async function deleteCategory(id: string): Promise<{ ok: true }> {
  await requireDashboardSession();
  await prisma.newsCategory.delete({ where: { id } });
  return { ok: true };
}
