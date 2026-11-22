import { prisma } from "./prisma-client.mjs";

const products = await prisma.product.findMany({ select: { id: true } });
const productIds = products.map((product) => product.id);
const productResult = productIds.length
  ? await prisma.product.updateMany({ where: { id: { in: productIds } }, data: { imageCaption: "", shipperImageCaption: "" } })
  : { count: 0 };
const galleryResult = productIds.length
  ? await prisma.productMedia.updateMany({ where: { productId: { in: productIds } }, data: { caption: "" } })
  : { count: 0 };
const translations = productIds.length
  ? await prisma.translationEntry.findMany({ where: { entityType: "PRODUCT", locale: "en", entityId: { in: productIds } }, select: { id: true, payload: true } })
  : [];
let translationCount = 0;
for (const entry of translations) {
  const payload = entry.payload && typeof entry.payload === "object" && !Array.isArray(entry.payload) ? { ...entry.payload } : {};
  let changed = false;
  for (const key of Object.keys(payload)) {
    if (key === "imageCaption" || key === "shipperImageCaption" || key.startsWith("galleryCaption_")) {
      delete payload[key];
      changed = true;
    }
  }
  if (changed) {
    await prisma.translationEntry.update({ where: { id: entry.id }, data: { payload } });
    translationCount++;
  }
}
console.log(JSON.stringify({ clearedProducts: productResult.count, clearedGallery: galleryResult.count, cleanedTranslations: translationCount }));
await prisma.$disconnect();
