"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { syncProductTranslation } from "@/lib/translation-service";
import { sanitizeProductHtml } from "@/lib/sanitize-product-html";
import { recordPermanentRedirect } from "@/lib/url-redirects";
import { revalidatePath } from "next/cache";
import { requireDashboardSession } from "./auth";
import { validateOfficialCanonical } from "./canonical-url";
import { validateManagedMediaUrl } from "./media-url";
import type { ProductInput, ProductListItem } from "./product-types";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function optional(value: string) {
  return value.trim() || null;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeProductInput(value: ProductInput): ProductInput {
  const input = value || ({} as ProductInput);
  return {
    ...input,
    slug: text(input.slug), title: text(input.title), titleHtml: text(input.titleHtml), titleColor: text(input.titleColor, "#243f55"), titleFontFamily: text(input.titleFontFamily, "Arial"),
    description: text(input.description), contentHtml: text(input.contentHtml), summaryHtml: text(input.summaryHtml), priceText: text(input.priceText), stockText: text(input.stockText),
    imageUrl: text(input.imageUrl), imageAlt: text(input.imageAlt), imageCaption: text(input.imageCaption), shipperImageUrl: text(input.shipperImageUrl), shipperImageAlt: text(input.shipperImageAlt), shipperImageCaption: text(input.shipperImageCaption), ogImageUrl: text(input.ogImageUrl), ogImageAlt: text(input.ogImageAlt),
    gallery: Array.isArray(input.gallery) ? input.gallery.map((item) => ({ ...item, url: text(item?.url), altText: text(item?.altText), caption: text(item?.caption), altTextEn: text(item?.altTextEn), captionEn: text(item?.captionEn) })) : [],
    metaTitle: text(input.metaTitle), metaDescription: text(input.metaDescription), canonicalUrl: text(input.canonicalUrl),
    translationMode: input.translationMode === "MANUAL" ? "MANUAL" : "AUTO", slugEn: text(input.slugEn), titleEn: text(input.titleEn), descriptionEn: text(input.descriptionEn), contentHtmlEn: text(input.contentHtmlEn), summaryHtmlEn: text(input.summaryHtmlEn),
    priceTextEn: text(input.priceTextEn), stockTextEn: text(input.stockTextEn), imageAltEn: text(input.imageAltEn), imageCaptionEn: text(input.imageCaptionEn), shipperImageAltEn: text(input.shipperImageAltEn), shipperImageCaptionEn: text(input.shipperImageCaptionEn), ogImageAltEn: text(input.ogImageAltEn), metaTitleEn: text(input.metaTitleEn), metaDescriptionEn: text(input.metaDescriptionEn), canonicalUrlEn: text(input.canonicalUrlEn),
  };
}

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function translationString(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object") return "";
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function toItem(row: any, translation?: any): ProductListItem {
  const payload = translation?.payload;
  const translatedSummary = translationString(payload, "summaryHtml");
  const incompleteManualTranslation = Boolean(translation?.manualOverride && row.summaryHtml?.trim() && !translatedSummary.trim());
  return {
    id: row.id,
    slug: text(row.slug),
    title: text(row.title),
    titleHtml: text(row.titleHtml),
    titleColor: text(row.titleColor, "#243f55"),
    titleFontFamily: text(row.titleFontFamily, "Arial"),
    titleFontSize: 28,
    titleFontWeight: row.titleFontWeight || 700,
    categoryId: text(row.categoryId),
    categoryName: text(row.category?.name),
    categorySlug: text(row.category?.slug),
    categoryNameEn: text(row.category?.nameEn),
    categorySlugEn: text(row.category?.slugEn),
    description: text(row.description),
    contentHtml: text(row.contentHtml),
    summaryHtml: text(row.summaryHtml),
    priceText: text(row.priceText, "Liên hệ"),
    stockText: text(row.stockText, "Còn hàng"),
    imageUrl: text(row.imageUrl),
    imageAlt: text(row.imageAlt),
    imageCaption: text(row.imageCaption),
    shipperImageUrl: text(row.shipperImageUrl),
    shipperImageAlt: text(row.shipperImageAlt),
    shipperImageCaption: text(row.shipperImageCaption),
    ogImageUrl: text(row.ogImageUrl),
    ogImageAlt: text(row.ogImageAlt),
    gallery: Array.isArray(row.gallery) ? row.gallery.map((item: any) => ({ id: item.id, url: text(item.url), altText: text(item.altText), caption: text(item.caption), altTextEn: translationString(payload, `galleryAlt_${item.id}`), captionEn: translationString(payload, `galleryCaption_${item.id}`), sortOrder: Number(item.sortOrder) || 0, isPrimary: Boolean(item.isPrimary) })) : [],
    metaTitle: text(row.metaTitle),
    metaDescription: text(row.metaDescription),
    canonicalUrl: text(row.canonicalUrl),
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
    translationMode: translation?.manualOverride && !incompleteManualTranslation ? "MANUAL" : "AUTO",
    translationStatus: translation?.status || "PENDING",
    translationError: translation?.errorMessage || "",
    slugEn: translation?.slug || "",
    titleEn: translationString(payload, "title"),
    descriptionEn: translationString(payload, "description"),
    contentHtmlEn: translationString(payload, "contentHtml"),
    summaryHtmlEn: translatedSummary,
    priceTextEn: translationString(payload, "priceText"),
    stockTextEn: translationString(payload, "stockText"),
    imageAltEn: translationString(payload, "imageAlt"),
    imageCaptionEn: translationString(payload, "imageCaption"),
    shipperImageAltEn: translationString(payload, "shipperImageAlt"),
    shipperImageCaptionEn: translationString(payload, "shipperImageCaption"),
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

export async function setProductVisibility(id: string, isPublished: boolean) {
  await requireDashboardSession();
  const row = await prisma.product.update({
    where: { id },
    data: { isPublished },
    include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } },
  });
  const translation = await prisma.translationEntry.findUnique({
    where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: id, locale: "en" } },
  });
  for (const path of ["/san-pham", "/en/products", `/san-pham/${row.category.slug}/${row.slug}`, translation?.slug ? `/en/products/${row.category.slugEn}/${translation.slug}` : null, "/sitemap.xml"]) {
    if (path) revalidatePath(path);
  }
  return { ok: true as const, product: toItem(row, translation) };
}

export async function saveProduct(input: ProductInput, options?: { preserveEnglish?: boolean }) {
  await requireDashboardSession();
  const preserveEnglish = Boolean(options?.preserveEnglish);
  input = normalizeProductInput(input);
  const title = input.title.trim();
  if (!title) throw new Error("Tên sản phẩm không được để trống.");
  const slug = slugify(input.slug || title);
  if (!slug) throw new Error("Slug sản phẩm không hợp lệ.");
  // Legacy products may already have a main image without alt text. Keep save
  // available for unrelated edits while ensuring the persisted image is
  // accessible with a deterministic product-title fallback.
  if (input.imageUrl.trim() && !input.imageAlt.trim()) input.imageAlt = title;
  if (input.shipperImageUrl.trim() && !input.shipperImageAlt.trim()) throw new Error("Ảnh giao hàng phải có alt text.");
  if (input.ogImageUrl.trim() && !input.ogImageAlt.trim()) throw new Error("Ảnh Open Graph phải có alt text.");
  if (input.metaTitle.trim().length > 65) throw new Error("SEO title không vượt quá 65 ký tự.");
  if (input.metaDescription.trim().length > 160) throw new Error("Meta description không vượt quá 160 ký tự.");
  if (input.translationMode === "MANUAL") {
    if (!input.titleEn.trim()) throw new Error("Tên sản phẩm English không được để trống khi tự nhập bản dịch.");
    if (!slugify(input.slugEn || input.titleEn)) throw new Error("Slug English không hợp lệ.");
    if (input.imageUrl.trim() && !input.imageAltEn.trim()) throw new Error("Ảnh chính phải có alt text English.");
    if (input.shipperImageUrl.trim() && !input.shipperImageAltEn.trim()) throw new Error("Ảnh giao hàng phải có alt text English.");
    if (input.metaTitleEn.trim().length > 65) throw new Error("SEO title English không vượt quá 65 ký tự.");
    if (input.metaDescriptionEn.trim().length > 160) throw new Error("Meta description English không vượt quá 160 ký tự.");
  }
  const category = await prisma.productCategory.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new Error("Danh mục sản phẩm không tồn tại.");
  const gallery = input.gallery.filter((item) => item.url.trim()).map((item, index) => ({
    url: validateManagedMediaUrl(item.url, `Ảnh album ${index + 1}`) || "",
    altText: item.altText.trim() || title,
    caption: item.caption.trim(),
    sortOrder: index,
    isPrimary: index === 0,
  }));
  const duplicate = await prisma.product.findFirst({ where: { slug, ...(input.id ? { NOT: { id: input.id } } : {}) }, select: { id: true } });
  if (duplicate) throw new Error("Slug sản phẩm đã tồn tại.");
  const defaultMetaTitle = title;
  const defaultMetaDescription = plainText(input.description || input.summaryHtml).slice(0, 160);
  const data = {
    slug,
    title,
    titleHtml: sanitizeProductHtml(input.titleHtml || `<p>${title}</p>`),
    titleColor: /^#[0-9a-f]{6}$/i.test(input.titleColor) ? input.titleColor : "#243f55",
    titleFontFamily: "Arial",
    titleFontSize: 28,
    titleFontWeight: [400, 500, 600, 700, 800, 900].includes(Number(input.titleFontWeight)) ? Number(input.titleFontWeight) : 700,
    categoryId: category.id,
    description: sanitizeProductHtml(input.description),
    contentHtml: sanitizeProductHtml(input.contentHtml),
    summaryHtml: sanitizeProductHtml(input.summaryHtml),
    priceText: input.priceText.trim() || "Liên hệ",
    stockText: input.stockText.trim() || "Còn hàng",
    imageUrl: validateManagedMediaUrl(input.imageUrl, "Ảnh chính") || "",
    imageAlt: input.imageAlt.trim() || title,
    imageCaption: input.imageCaption.trim(),
    shipperImageUrl: validateManagedMediaUrl(input.shipperImageUrl, "Ảnh giao hàng") || "",
    shipperImageAlt: input.shipperImageAlt.trim(),
    shipperImageCaption: input.shipperImageCaption.trim(),
    ogImageUrl: validateManagedMediaUrl(input.ogImageUrl, "Ảnh Open Graph") || "",
    ogImageAlt: input.ogImageAlt.trim(),
    metaTitle: optional(input.metaTitle || defaultMetaTitle),
    metaDescription: optional(input.metaDescription || defaultMetaDescription),
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
    if (input.translationMode === "MANUAL" && !preserveEnglish) {
      const slugEn = slugify(input.slugEn || input.titleEn);
      const duplicateEnglish = await tx.translationEntry.findFirst({ where: { entityType: "PRODUCT", locale: "en", slug: slugEn, NOT: { entityId: saved.id } }, select: { id: true } });
      if (duplicateEnglish) throw new Error("Slug sản phẩm English đã tồn tại.");
      const payload = {
        title: input.titleEn.trim(), description: sanitizeProductHtml(input.descriptionEn),
        summaryHtml: sanitizeProductHtml(input.summaryHtmlEn), contentHtml: sanitizeProductHtml(input.contentHtmlEn),
        priceText: input.priceTextEn.trim() || "Contact us", stockText: input.stockTextEn.trim() || "In stock",
        imageAlt: input.imageAltEn.trim(), imageCaption: input.imageCaptionEn.trim(),
        shipperImageAlt: input.shipperImageAltEn.trim(), shipperImageCaption: input.shipperImageCaptionEn.trim(),
        ogImageAlt: input.ogImageAltEn.trim(),
        metaTitle: input.metaTitleEn.trim(), metaDescription: input.metaDescriptionEn.trim(),
        canonicalUrl: validateOfficialCanonical(input.canonicalUrlEn, { fieldLabel: "Canonical English", pathPrefix: "/en/products/" }) || "",
        ...Object.fromEntries(saved.gallery.flatMap((item: any, index: number) => [[`galleryAlt_${item.id}`, input.gallery[index]?.altTextEn?.trim() || input.titleEn.trim()], [`galleryCaption_${item.id}`, input.gallery[index]?.captionEn?.trim() || ""]])),
      };
      const sourceHash = crypto.createHash("sha256").update(JSON.stringify({ title: saved.title, description: saved.description, summaryHtml: saved.summaryHtml, contentHtml: saved.contentHtml, priceText: saved.priceText, stockText: saved.stockText, imageAlt: saved.imageAlt, imageCaption: saved.imageCaption, shipperImageAlt: saved.shipperImageAlt, shipperImageCaption: saved.shipperImageCaption, ogImageAlt: saved.ogImageAlt, metaTitle: saved.metaTitle, metaDescription: saved.metaDescription, gallery: saved.gallery.map((item: any) => ({ id: item.id, altText: item.altText, caption: item.caption })), categoryName: saved.category.name, categoryNameEn: saved.category.nameEn })).digest("hex");
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
    if (preserveEnglish && transactionResult.previousTranslation?.manualOverride) {
      translation = transactionResult.previousTranslation;
    } else {
      if (transactionResult.previousTranslation?.manualOverride) await prisma.translationEntry.update({ where: { id: transactionResult.previousTranslation.id }, data: { manualOverride: false } });
      translation = await syncProductTranslation({ ...fresh, categoryName: fresh.category.name, categoryNameEn: fresh.category.nameEn }, { force: input.translationMode === "AUTO" });
    }
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

/**
 * Duplicate only the GEDECO product record and its managed media.  This is
 * intentionally implemented against the GEDECO schema rather than importing
 * the source project's catalogue model.
 */
export async function duplicateProduct(id: string) {
  await requireDashboardSession();
  const source = await prisma.product.findUnique({
    where: { id },
    include: {
      gallery: { orderBy: { sortOrder: "asc" } },
      category: true,
      // The English translation belongs to the same product entity and must
      // be copied with a new, unique slug when available.
    },
  });
  if (!source) throw new Error("Không tìm thấy sản phẩm cần nhân bản.");
  const sourceTranslation = await prisma.translationEntry.findUnique({
    where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: id, locale: "en" } },
  });
  const suffix = `copy-${Date.now().toString(36)}`;
  const slug = `${source.slug}-${suffix}`.slice(0, 120);
  const translationSlug = sourceTranslation?.slug ? `${sourceTranslation.slug}-${suffix}`.slice(0, 120) : null;
  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        slug,
        title: `${source.title} (bản sao)`,
        categoryId: source.categoryId,
        description: source.description,
        contentHtml: source.contentHtml,
        summaryHtml: source.summaryHtml,
        priceText: source.priceText,
        stockText: source.stockText,
        imageUrl: source.imageUrl,
        imageAlt: source.imageAlt,
        imageCaption: source.imageCaption,
        shipperImageUrl: source.shipperImageUrl,
        shipperImageAlt: source.shipperImageAlt,
        shipperImageCaption: source.shipperImageCaption,
        ogImageUrl: source.ogImageUrl,
        ogImageAlt: source.ogImageAlt,
        metaTitle: source.metaTitle,
        metaDescription: source.metaDescription,
        canonicalUrl: null,
        robotsIndex: source.robotsIndex,
        robotsFollow: source.robotsFollow,
        isPublished: false,
        sortOrder: source.sortOrder,
      },
    });
    if (source.gallery.length) {
      await tx.productMedia.createMany({
        data: source.gallery.map((media) => ({
          productId: product.id,
          url: media.url,
          altText: media.altText,
          caption: media.caption,
          sortOrder: media.sortOrder,
          isPrimary: media.isPrimary,
        })),
      });
    }
    if (sourceTranslation && translationSlug) {
      await tx.translationEntry.create({
        data: {
          entityType: "PRODUCT",
          entityId: product.id,
          locale: "en",
          slug: translationSlug,
          payload: sourceTranslation.payload === null ? {} : sourceTranslation.payload,
          sourceUpdatedAt: product.updatedAt,
          sourceHash: sourceTranslation.sourceHash,
          status: "NEEDS_REVIEW",
          provider: sourceTranslation.provider,
          errorMessage: "Bản sao cần rà soát nội dung trước khi công khai.",
          manualOverride: false,
        },
      });
    }
    return product;
  });
  revalidatePath("/san-pham");
  revalidatePath("/en/products");
  return { ok: true as const, id: result.id };
}
