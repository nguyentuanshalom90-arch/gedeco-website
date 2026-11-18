import fs from "node:fs";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const source = fs.readFileSync(new URL("../app/data/product-details.ts", import.meta.url), "utf8");
const match = source.match(/gedecoProductDetails:\s*GedecoProductDetail\[\]\s*=\s*([\s\S]*);\s*$/m) || source.match(/gedecoProductDetails\s*=\s*([\s\S]*);\s*$/m);
if (!match) throw new Error("Không đọc được dữ liệu sản phẩm nguồn.");
const products = Function(`"use strict"; return (${match[1]})`)();
const englishSource = fs.readFileSync(new URL("../app/data/product-translations-en.ts", import.meta.url), "utf8");
const englishMatch = englishSource.match(/englishProductTranslations\s*=\s*([\s\S]*?)\s+as const;/);
if (!englishMatch) throw new Error("Không đọc được dữ liệu English sản phẩm nguồn.");
const englishProducts = JSON.parse(englishMatch[1]);
const prisma = new PrismaClient();
try {
  const [domestic, exported] = await Promise.all([
    prisma.productCategory.upsert({ where: { slug: "trong-nuoc" }, create: { id: "product-category-domestic", name: "Sản phẩm trong nước", slug: "trong-nuoc", nameEn: "Domestic products", slugEn: "domestic", sortOrder: 10 }, update: {} }),
    prisma.productCategory.upsert({ where: { slug: "xuat-khau" }, create: { id: "product-category-export", name: "Sản phẩm xuất khẩu", slug: "xuat-khau", nameEn: "Export products", slugEn: "export", sortOrder: 20 }, update: {} }),
  ]);
  for (const [index, item] of products.entries()) {
    const existing = await prisma.product.findUnique({ where: { slug: item.slug }, include: { gallery: true } });
    const row = await prisma.product.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug, title: item.title, categoryId: item.category === "Sản phẩm xuất khẩu" ? exported.id : domestic.id,
        description: item.description || "", contentHtml: item.contentHtml || "", summaryHtml: item.summaryHtml || "",
        priceText: item.priceText || "Liên hệ", stockText: item.stockText || "Còn hàng",
        imageUrl: item.image, shipperImageUrl: item.shipperImage || "", shipperImageAlt: item.shipperImage ? item.shipperImageAlt || item.title : "", shipperImageCaption: item.shipperImageCaption || "", sortOrder: index,
      },
      update: {},
    });
    if (!existing || existing.gallery.length === 0) {
      const urls = [item.image, ...(item.gallery || [])].filter(Boolean);
      await prisma.productMedia.createMany({ data: urls.map((url, mediaIndex) => ({ productId: row.id, url, altText: item.title, sortOrder: mediaIndex, isPrimary: mediaIndex === 0 })) });
    }
    const english = englishProducts[item.slug];
    if (english) {
      const currentTranslation = await prisma.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: row.id, locale: "en" } } });
      if (!currentTranslation) {
        const sourceHash = crypto.createHash("sha256").update(JSON.stringify({ slug: row.slug, title: row.title, description: row.description, contentHtml: row.contentHtml, summaryHtml: row.summaryHtml, priceText: row.priceText, stockText: row.stockText })).digest("hex");
        await prisma.translationEntry.create({
          data: {
            entityType: "PRODUCT", entityId: row.id, locale: "en", slug: english.slug,
            payload: { title: english.title, description: english.description || "", contentHtml: english.contentHtml || "", summaryHtml: english.summaryHtml || "", priceText: english.priceText || "Contact us", stockText: english.stockText || "In stock", imageAlt: english.title, imageCaption: "", shipperImageAlt: english.shipperImageAlt || "Delivery service", shipperImageCaption: english.shipperImageCaption || "", ogImageAlt: english.title, metaTitle: english.title, metaDescription: english.description || "" },
            sourceUpdatedAt: row.updatedAt, sourceHash, status: "TRANSLATED", provider: "legacy-import", manualOverride: true, translatedAt: new Date(), reviewedAt: new Date(),
          },
        });
      }
    }
  }
  console.log(`Đã đồng bộ ${products.length} sản phẩm và dữ liệu English còn thiếu vào database.`);
} finally { await prisma.$disconnect(); }
