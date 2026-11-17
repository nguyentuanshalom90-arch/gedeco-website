"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { syncProductTranslation } from "@/lib/translation-service";
import { sanitizeProductHtml } from "@/lib/sanitize-product-html";
import { recordPermanentRedirect } from "@/lib/url-redirects";
import { revalidatePath } from "next/cache";
import { requireDashboardSession } from "./auth";
import { validateOfficialCanonical } from "./canonical-url";
import type { ProductInput, ProductListItem } from "./product-types";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function optional(value: string) {
  return value.trim() || null;
}

function translationString(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object") return "";
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function toItem(row: any, translation?: any): ProductListItem {
  const payload = translation?.payload;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
    categoryNameEn: row.category.nameEn,
    categorySlugEn: row.category.slugEn,
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
    gallery: row.gallery.map((item: any) => ({ id: item.id, url: item.url, altText: item.altText, caption: item.caption, altTextEn: translationString(payload, `galleryAlt_${item.id}`), captionEn: translationString(payload, `galleryCaption_${item.id}`), sortOrder: item.sortOrder, isPrimary: item.isPrimary })),
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    canonicalUrl: row.canonicalUrl ?? "",
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
    translationMode: translation?.manualOverride ? "MANUAL" : "AUTO",
    translationStatus: translation?.status || "PENDING",
    translationError: translation?.errorMessage || "",
    slugEn: translation?.slug || "",
    titleEn: translationString(payload, "title"),
    descriptionEn: translationString(payload, "description"),
    contentHtmlEn: translationString(payload, "contentHtml"),
    summaryHtmlEn: translationString(payload, "summaryHtml"),
    priceTextEn: translationString(payload, "priceText"),
    stockTextEn: translationString(payload, "stockText"),
    imageAltEn: translationString(payload, "imageAlt"),
    imageCaptionEn: translationString(payload, "imageCaption"),
    ogImageAltEn: translationString(payload, "ogImageAlt"),
    metaTitleEn: translationString(payload, "metaTitle"),
    metaDescriptionEn: translationString(payload, "metaDescription"),
    canonicalUrlEn: translationString(payload, "canonicalUrl"),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listDashboardProducts() {
  await requireDashboardSession();
  const rows = await prisma.product.findMany({ include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  const translations = await prisma.translationEntry.findMany({ where: { entityType: "PRODUCT", locale: "en", entityId: { in: rows.map((row) => row.id) } } });
  const byId = new Map(translations.map((translation) => [translation.entityId, translation]));
  return rows.map((row) => toItem(row, byId.get(row.id)));
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
  if (input.translationMode === "MANUAL") {
    if (!input.titleEn.trim()) throw new Error("Tên sản phẩm English không được để trống khi tự nhập bản dịch.");
    if (!slugify(input.slugEn || input.titleEn)) throw new Error("Slug English không hợp lệ.");
    if (input.imageUrl.trim() && !input.imageAltEn.trim()) throw new Error("Ảnh chính phải có alt text English.");
    if (input.metaTitleEn.trim().length > 65) throw new Error("SEO title English không vượt quá 65 ký tự.");
    if (input.metaDescriptionEn.trim().length > 160) throw new Error("Meta description English không vượt quá 160 ký tự.");
  }
  const category = await prisma.productCategory.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new Error("Danh mục sản phẩm không tồn tại.");
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
    categoryId: category.id,
    description: input.description.trim(),
    contentHtml: sanitizeProductHtml(input.contentHtml),
    summaryHtml: sanitizeProductHtml(input.summaryHtml),
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
    canonicalUrl: validateOfficialCanonical(input.canonicalUrl, { fieldLabel: "Canonical sản phẩm", pathPrefix: "/san-pham/" }),
    robotsIndex: input.robotsIndex,
    robotsFollow: input.robotsFollow,
    isPublished: input.isPublished,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
  };
  const transactionResult = await prisma.$transaction(async (tx) => {
    const previous = input.id ? await tx.product.findUnique({ where: { id: input.id }, include: { category: true } }) : null;
    const previousTranslation = input.id ? await tx.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: input.id, locale: "en" } } }) : null;
    const row = input.id
      ? await tx.product.update({ where: { id: input.id }, data })
      : await tx.product.create({ data });
    await tx.productMedia.deleteMany({ where: { productId: row.id } });
    if (gallery.length) await tx.productMedia.createMany({ data: gallery.map((item) => ({ productId: row.id, ...item })) });
    const saved = await tx.product.findUniqueOrThrow({ where: { id: row.id }, include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } } });
    if (previous && (previous.slug !== saved.slug || previous.category.slug !== saved.category.slug)) {
      await recordPermanentRedirect(tx, `/san-pham/${previous.category.slug}/${previous.slug}`, `/san-pham/${saved.category.slug}/${saved.slug}`);
    }
    let manualTranslation = null;
    if (input.translationMode === "MANUAL") {
      const slugEn = slugify(input.slugEn || input.titleEn);
      const duplicateEnglish = await tx.translationEntry.findFirst({ where: { entityType: "PRODUCT", locale: "en", slug: slugEn, NOT: { entityId: saved.id } }, select: { id: true } });
      if (duplicateEnglish) throw new Error("Slug sản phẩm English đã tồn tại.");
      const payload = {
        title: input.titleEn.trim(), description: input.descriptionEn.trim(),
        summaryHtml: sanitizeProductHtml(input.summaryHtmlEn), contentHtml: sanitizeProductHtml(input.contentHtmlEn),
        priceText: input.priceTextEn.trim() || "Contact us", stockText: input.stockTextEn.trim() || "In stock",
        imageAlt: input.imageAltEn.trim(), imageCaption: input.imageCaptionEn.trim(), ogImageAlt: input.ogImageAltEn.trim(),
        metaTitle: input.metaTitleEn.trim(), metaDescription: input.metaDescriptionEn.trim(),
        canonicalUrl: validateOfficialCanonical(input.canonicalUrlEn, { fieldLabel: "Canonical English", pathPrefix: "/en/products/" }) || "",
        ...Object.fromEntries(saved.gallery.flatMap((item: any, index: number) => [[`galleryAlt_${item.id}`, input.gallery[index]?.altTextEn?.trim() || input.titleEn.trim()], [`galleryCaption_${item.id}`, input.gallery[index]?.captionEn?.trim() || ""]])),
      };
      const sourceHash = crypto.createHash("sha256").update(JSON.stringify({ title: saved.title, description: saved.description, summaryHtml: saved.summaryHtml, contentHtml: saved.contentHtml, priceText: saved.priceText, stockText: saved.stockText, imageAlt: saved.imageAlt, imageCaption: saved.imageCaption, ogImageAlt: saved.ogImageAlt, metaTitle: saved.metaTitle, metaDescription: saved.metaDescription, gallery: saved.gallery.map((item: any) => ({ id: item.id, altText: item.altText, caption: item.caption })), categoryName: saved.category.name, categoryNameEn: saved.category.nameEn })).digest("hex");
      manualTranslation = await tx.translationEntry.upsert({
        where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: saved.id, locale: "en" } },
        create: { entityType: "PRODUCT", entityId: saved.id, locale: "en", slug: slugEn, payload, sourceUpdatedAt: saved.updatedAt, sourceHash, status: "TRANSLATED", provider: "manual", manualOverride: true, translatedAt: new Date(), reviewedAt: new Date() },
        update: { slug: slugEn, payload, sourceUpdatedAt: saved.updatedAt, sourceHash, status: "TRANSLATED", provider: "manual", manualOverride: true, errorMessage: null, translatedAt: new Date(), reviewedAt: new Date() },
      });
      if (previousTranslation?.status === "TRANSLATED" && previousTranslation.slug && (previousTranslation.slug !== slugEn || previous?.category.slugEn !== saved.category.slugEn)) {
        await recordPermanentRedirect(tx, `/en/products/${previous?.category.slugEn || saved.category.slugEn}/${previousTranslation.slug}`, `/en/products/${saved.category.slugEn}/${slugEn}`);
      }
    }
    return { saved, previous, previousTranslation, manualTranslation };
  });
  const fresh = transactionResult.saved;
  let translation = transactionResult.manualTranslation;
  if (!translation) {
    if (transactionResult.previousTranslation?.manualOverride) await prisma.translationEntry.update({ where: { id: transactionResult.previousTranslation.id }, data: { manualOverride: false } });
    translation = await syncProductTranslation({ ...fresh, categoryName: fresh.category.name, categoryNameEn: fresh.category.nameEn });
    if (translation.status === "TRANSLATED" && translation.slug && transactionResult.previousTranslation?.status === "TRANSLATED" && transactionResult.previousTranslation.slug && (translation.slug !== transactionResult.previousTranslation.slug || fresh.category.slugEn !== transactionResult.previous?.category.slugEn)) {
      await prisma.$transaction((tx) => recordPermanentRedirect(tx, `/en/products/${transactionResult.previous?.category.slugEn || fresh.category.slugEn}/${transactionResult.previousTranslation!.slug}`, `/en/products/${fresh.category.slugEn}/${translation!.slug}`));
    }
  }
  for (const path of ["/san-pham", "/en/products", `/san-pham/${fresh.category.slug}/${fresh.slug}`, translation.slug ? `/en/products/${fresh.category.slugEn}/${translation.slug}` : null, "/sitemap.xml"]) if (path) revalidatePath(path);
  return { ok: true as const, product: toItem(fresh, translation), translation: { status: translation.status, errorMessage: translation.errorMessage } };
}

export async function deleteProduct(id: string) {
  await requireDashboardSession();
  const removed = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id }, include: { category: true } });
    if (!product) return null;
    const translation = await tx.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: id, locale: "en" } } });
    const vi = `/san-pham/${product.category.slug}/${product.slug}`;
    const en = translation?.slug ? `/en/products/${product.category.slugEn}/${translation.slug}` : null;
    await tx.translationEntry.deleteMany({ where: { entityType: "PRODUCT", entityId: id } });
    await tx.urlRedirect.deleteMany({ where: { OR: [{ sourcePath: vi }, { destinationPath: vi }, ...(en ? [{ sourcePath: en }, { destinationPath: en }] : [])] } });
    await tx.product.delete({ where: { id } });
    return { vi, en };
  });
  if (removed) for (const path of ["/san-pham", "/en/products", removed.vi, removed.en, "/sitemap.xml"]) if (path) revalidatePath(path);
  return { ok: true as const };
}
