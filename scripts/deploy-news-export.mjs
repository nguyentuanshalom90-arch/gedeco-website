import fs from "node:fs";
import { prisma } from "./prisma-client.mjs";

const output = process.argv[2] || "news-export.json";
const [categories, articles, translations] = await Promise.all([
  prisma.newsCategory.findMany({ orderBy: { createdAt: "asc" } }),
  prisma.newsArticle.findMany({ orderBy: { createdAt: "asc" } }),
  prisma.translationEntry.findMany({ where: { entityType: "NEWS_ARTICLE", locale: "en" }, orderBy: { createdAt: "asc" } }),
]);
fs.writeFileSync(output, JSON.stringify({ exportedAt: new Date().toISOString(), categories, articles, translations }, null, 2));
console.log(JSON.stringify({ output, categories: categories.length, articles: articles.length, translations: translations.length }));
await prisma["$disconnect"]();
