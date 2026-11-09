import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const source = fs.readFileSync(new URL("../app/data/product-details.ts", import.meta.url), "utf8");
const match = source.match(/gedecoProductDetails:\s*GedecoProductDetail\[\]\s*=\s*([\s\S]*);\s*$/m) || source.match(/gedecoProductDetails\s*=\s*([\s\S]*);\s*$/m);
if (!match) throw new Error("Không đọc được dữ liệu sản phẩm nguồn.");
const products = Function(`"use strict"; return (${match[1]})`)();
const prisma = new PrismaClient();
const category = (value) => value === "Sản phẩm xuất khẩu" ? "EXPORT" : "DOMESTIC";
try {
  for (const [index, item] of products.entries()) {
    const existing = await prisma.product.findUnique({ where: { slug: item.slug }, include: { gallery: true } });
    const row = await prisma.product.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug, title: item.title, category: category(item.category),
        description: item.description || "", contentHtml: item.contentHtml || "", summaryHtml: item.summaryHtml || "",
        priceText: item.priceText || "Liên hệ", stockText: item.stockText || "Còn hàng",
        imageUrl: item.image, shipperImageUrl: item.shipperImage || "", sortOrder: index,
      },
      update: {},
    });
    if (!existing || existing.gallery.length === 0) {
      const urls = [item.image, ...(item.gallery || [])].filter(Boolean);
      await prisma.productMedia.createMany({ data: urls.map((url, mediaIndex) => ({ productId: row.id, url, altText: item.title, sortOrder: mediaIndex, isPrimary: mediaIndex === 0 })) });
    }
  }
  console.log(`Đã đồng bộ ${products.length} sản phẩm vào database.`);
} finally { await prisma.$disconnect(); }
