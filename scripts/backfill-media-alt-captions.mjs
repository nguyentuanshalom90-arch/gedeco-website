import { prisma } from "./prisma-client.mjs";

const clean = (value) => String(value ?? "").trim();
const fallbackName = (value) => clean(value).replace(/\.(optimized|derivative)\.(webp|png|jpe?g|gif|svg)$/i, "").replace(/\.(webp|png|jpe?g|gif|svg)$/i, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
const setIfBlank = (current, value) => clean(current) || value;
let counts = { mediaAssets: 0, products: 0, productGallery: 0, productTranslations: 0, news: 0, newsTranslations: 0, siteContent: 0, siteChrome: 0 };

const [assets, products, news, content, chrome] = await Promise.all([
  prisma.mediaAsset.findMany({ where: { archivedAt: null } }),
  prisma.product.findMany({ include: { gallery: { orderBy: { sortOrder: "asc" } } } }),
  prisma.newsArticle.findMany(),
  prisma.siteDynamicContent.findMany({ where: { imageUrl: { not: "" } } }),
  prisma.siteChromeContent.findMany({ where: { imageUrl: { not: "" } } }),
]);

for (const asset of assets) {
  const name = fallbackName(asset.originalName) || "Hình ảnh GEDECO";
  const data = { altText: setIfBlank(asset.altText, name), caption: setIfBlank(asset.caption, `Hình ảnh ${name}`) };
  if (data.altText !== asset.altText || data.caption !== asset.caption) { await prisma.mediaAsset.update({ where: { id: asset.id }, data }); counts.mediaAssets++; }
}

for (const product of products) {
  const title = clean(product.title) || "Sản phẩm GEDECO";
  const data = {
    imageAlt: product.imageUrl ? setIfBlank(product.imageAlt, title) : product.imageAlt,
    imageCaption: "",
    shipperImageAlt: product.shipperImageUrl ? setIfBlank(product.shipperImageAlt, `Giao hàng sản phẩm ${title}`) : product.shipperImageAlt,
    shipperImageCaption: "",
    ogImageAlt: product.ogImageUrl ? setIfBlank(product.ogImageAlt, title) : product.ogImageAlt,
  };
  if (data.imageAlt !== product.imageAlt || data.imageCaption !== product.imageCaption || data.shipperImageAlt !== product.shipperImageAlt || data.shipperImageCaption !== product.shipperImageCaption || data.ogImageAlt !== product.ogImageAlt) { await prisma.product.update({ where: { id: product.id }, data }); counts.products++; }
  for (const [index, media] of product.gallery.entries()) {
    const altText = setIfBlank(media.altText, title);
    const caption = "";
    if (altText !== media.altText || caption !== media.caption) { await prisma.productMedia.update({ where: { id: media.id }, data: { altText, caption } }); counts.productGallery++; }
  }
}

for (const article of news) {
  if (!article.imageUrl) continue;
  const title = clean(article.title) || "Bài viết GEDECO";
  const data = { imageAlt: setIfBlank(article.imageAlt, title), imageCaption: setIfBlank(article.imageCaption, `Ảnh bài viết: ${title}`) };
  if (data.imageAlt !== article.imageAlt || data.imageCaption !== article.imageCaption) { await prisma.newsArticle.update({ where: { id: article.id }, data }); counts.news++; }
}

for (const row of content) {
  const label = clean(row.label) || "nội dung GEDECO";
  const data = { altText: setIfBlank(row.altText, `Hình ảnh ${label}`), imageCaption: setIfBlank(row.imageCaption, `Hình ảnh ${label}`) };
  if (data.altText !== row.altText || data.imageCaption !== row.imageCaption) { await prisma.siteDynamicContent.update({ where: { id: row.id }, data }); counts.siteContent++; }
}

for (const row of chrome) {
  const label = clean(row.label) || "GEDECO";
  const data = { altText: setIfBlank(row.altText, `Hình ảnh ${label}`), imageCaption: setIfBlank(row.imageCaption, `Hình ảnh ${label}`) };
  if (data.altText !== row.altText || data.imageCaption !== row.imageCaption) { await prisma.siteChromeContent.update({ where: { id: row.id }, data }); counts.siteChrome++; }
}

const productIds = products.map((x) => x.id);
const articleIds = news.map((x) => x.id);
const translations = await prisma.translationEntry.findMany({ where: { locale: "en", OR: [{ entityType: "PRODUCT", entityId: { in: productIds } }, { entityType: "NEWS_ARTICLE", entityId: { in: articleIds } }] } });
for (const entry of translations) {
  const payload = entry.payload && typeof entry.payload === "object" && !Array.isArray(entry.payload) ? { ...entry.payload } : {};
  const product = entry.entityType === "PRODUCT" ? products.find((x) => x.id === entry.entityId) : null;
  const article = entry.entityType === "NEWS_ARTICLE" ? news.find((x) => x.id === entry.entityId) : null;
  const title = clean(payload.title) || clean(product?.title) || clean(article?.title) || "GEDECO";
  const next = { ...payload };
  if (product?.imageUrl) next.imageAlt = setIfBlank(next.imageAlt, `Product image: ${title}`);
  if (product?.imageUrl) delete next.imageCaption;
  if (product?.shipperImageUrl) { next.shipperImageAlt = setIfBlank(next.shipperImageAlt, `Delivery image for ${title}`); delete next.shipperImageCaption; }
  if (product?.ogImageUrl) next.ogImageAlt = setIfBlank(next.ogImageAlt, `Product image: ${title}`);
  if (product) for (const [index, media] of product.gallery.entries()) { next[`galleryAlt_${media.id}`] = setIfBlank(next[`galleryAlt_${media.id}`], `Product image ${index + 1}: ${title}`); delete next[`galleryCaption_${media.id}`]; }
  if (article?.imageUrl) { next.imageAlt = setIfBlank(next.imageAlt, `Article image: ${title}`); next.imageCaption = setIfBlank(next.imageCaption, `Article image: ${title}`); next.ogImageAlt = setIfBlank(next.ogImageAlt, `Article image: ${title}`); }
  if (JSON.stringify(next) !== JSON.stringify(payload)) { await prisma.translationEntry.update({ where: { id: entry.id }, data: { payload: next } }); if (product) counts.productTranslations++; else counts.newsTranslations++; }
}

console.log(`MEDIA_ALT_CAPTION_BACKFILL_PASS ${JSON.stringify(counts)}`);
await prisma.$disconnect();
