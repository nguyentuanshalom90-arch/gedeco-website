import { prisma } from "./prisma-client.mjs";

const blank = (value) => !String(value ?? "").trim();
const result = {};
const [assets, products, categories, news, content, chrome] = await Promise.all([
  prisma.mediaAsset.findMany({ where: { archivedAt: null }, select: { id: true, originalName: true, altText: true, caption: true } }),
  prisma.product.findMany({ select: { id: true, title: true, imageUrl: true, imageAlt: true, imageCaption: true, shipperImageUrl: true, shipperImageAlt: true, shipperImageCaption: true, ogImageUrl: true, ogImageAlt: true, gallery: true } }),
  prisma.productCategory.findMany({ select: { id: true, name: true, imageUrl: true, imageAlt: true, imageCaption: true, imageAltEn: true, imageCaptionEn: true } }),
  prisma.newsArticle.findMany({ select: { id: true, title: true, imageUrl: true, imageAlt: true, imageCaption: true } }),
  prisma.siteDynamicContent.findMany({ select: { id: true, label: true, imageUrl: true, altText: true, imageCaption: true } }),
  prisma.siteChromeContent.findMany({ select: { id: true, label: true, imageUrl: true, altText: true, imageCaption: true } }),
]);
result.assets = { total: assets.length, missingAlt: assets.filter((x) => blank(x.altText)).length, missingCaption: assets.filter((x) => blank(x.caption)).length };
result.products = { total: products.length, gallery: products.reduce((n, x) => n + x.gallery.length, 0), missingImageAlt: products.filter((x) => x.imageUrl && blank(x.imageAlt)).length, populatedImageCaption: products.filter((x) => x.imageCaption.trim()).length, missingGalleryAlt: products.reduce((n, x) => n + x.gallery.filter((m) => blank(m.altText)).length, 0), populatedGalleryCaption: products.reduce((n, x) => n + x.gallery.filter((m) => m.caption.trim()).length, 0), missingShipperAlt: products.filter((x) => x.shipperImageUrl && blank(x.shipperImageAlt)).length, populatedShipperCaption: products.filter((x) => x.shipperImageCaption.trim()).length, missingOgAlt: products.filter((x) => x.ogImageUrl && blank(x.ogImageAlt)).length, captionsDisabled: true };
result.categories = { total: categories.length, withImage: categories.filter((x) => x.imageUrl).length, missingAlt: categories.filter((x) => x.imageUrl && blank(x.imageAlt)).length, missingCaption: categories.filter((x) => x.imageUrl && blank(x.imageCaption)).length, missingAltEn: categories.filter((x) => x.imageUrl && blank(x.imageAltEn)).length, missingCaptionEn: categories.filter((x) => x.imageUrl && blank(x.imageCaptionEn)).length };
result.news = { total: news.length, withImage: news.filter((x) => x.imageUrl).length, missingAlt: news.filter((x) => x.imageUrl && blank(x.imageAlt)).length, missingCaption: news.filter((x) => x.imageUrl && blank(x.imageCaption)).length };
result.siteContent = { total: content.length, withImage: content.filter((x) => x.imageUrl).length, missingAlt: content.filter((x) => x.imageUrl && blank(x.altText)).length, missingCaption: content.filter((x) => x.imageUrl && blank(x.imageCaption)).length };
result.siteChrome = { total: chrome.length, withImage: chrome.filter((x) => x.imageUrl).length, missingAlt: chrome.filter((x) => x.imageUrl && blank(x.altText)).length, missingCaption: chrome.filter((x) => x.imageUrl && blank(x.imageCaption)).length };
console.log(JSON.stringify({ result, samples: { assets: assets.slice(0, 8), products: products.filter((x) => x.imageUrl).slice(0, 3).map((x) => ({ title: x.title, imageUrl: x.imageUrl, imageAlt: x.imageAlt, imageCaption: x.imageCaption, gallery: x.gallery })) } }, null, 2));
await prisma.$disconnect();
