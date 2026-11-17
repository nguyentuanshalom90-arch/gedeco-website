import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { validateOfficialCanonical } from "../lib/dashboard/canonical-url.ts";

const projectRoot = process.cwd();
const baseUrl = process.env.NEWS_TEST_BASE_URL || "http://127.0.0.1:3000";

async function loadEnvFile(filename) {
  try {
    const source = await fs.readFile(path.join(projectRoot, filename), "utf8");
    for (const rawLine of source.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

await loadEnvFile(".env.local");
await loadEnvFile(".env");

assert.equal(validateOfficialCanonical("/tin-tuc/qa", { pathPrefix: "/tin-tuc/" }), "/tin-tuc/qa");
assert.equal(validateOfficialCanonical("https://www.gedeco.vn/en/news/category/qa", { pathPrefix: "/en/news/category/" }), "https://www.gedeco.vn/en/news/category/qa");
for (const invalid of [
  "http://gedeco.vn/tin-tuc/qa",
  "https://evil.example/tin-tuc/qa",
  "https://gedeco.vn:444/tin-tuc/qa",
  "https://user@gedeco.vn/tin-tuc/qa",
  "https://gedeco.vn/tin-tuc/qa#fragment",
  "//evil.example/tin-tuc/qa",
  "/san-pham/qa",
]) {
  assert.throws(() => validateOfficialCanonical(invalid, { pathPrefix: "/tin-tuc/" }), undefined, `Canonical nguy hiểm phải bị từ chối: ${invalid}`);
}

const prisma = new PrismaClient();
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
let categoryId = "";
let articleId = "";

const expectedCategories = [
  ["Tin tức", "tin-tuc", "News", "news"],
  ["Chuỗi cung ứng", "chuoi-cung-ung", "Supply Chain", "supply-chain"],
  ["Hoạt động GEDECO", "hoat-dong-gedeco", "GEDECO Activities", "gedeco-activities"],
  ["Hợp tác", "hop-tac", "Partnerships", "partnerships"],
  ["Kiến thức & chia sẻ", "kien-thuc-chia-se", "Knowledge & Insights", "knowledge-insights"],
  ["Logistics", "logistics", "Logistics", "logistics"],
  ["Thị trường", "thi-truong", "Markets", "markets"],
];

const legacyRedirects = [
  ["ho-i-cng-ng", "chuoi-cung-ung"],
  ["oa-t-o-ng", "hoat-dong-gedeco"],
  ["o-p-ta-c", "hop-tac"],
  ["ie-n-th-c-chia-se", "kien-thuc-chia-se"],
  ["ogistics", "logistics"],
  ["hi-tr-o-ng", "thi-truong"],
];

try {
  const managedCategories = await prisma.newsCategory.findMany({
    where: { name: { in: expectedCategories.map(([name]) => name) } },
  });
  for (const [name, slug, nameEn, slugEn] of expectedCategories) {
    const category = managedCategories.find((item) => item.name === name);
    assert(category, `Thiếu danh mục ${name}.`);
    assert.equal(category.slug, slug, `Slug tiếng Việt sai cho ${name}.`);
    assert.equal(category.nameEn, nameEn, `Tên English sai cho ${name}.`);
    assert.equal(category.slugEn, slugEn, `Slug English sai cho ${name}.`);
    for (const field of ["description", "descriptionEn", "metaTitle", "metaDescription", "metaTitleEn", "metaDescriptionEn"]) {
      assert(category[field]?.trim(), `${name} thiếu ${field}.`);
    }
  }

  for (const [legacySlug, normalizedSlug] of legacyRedirects) {
    const response = await fetch(`${baseUrl}/tin-tuc/danh-muc/${legacySlug}`, { redirect: "manual" });
    assert.equal(response.status, 308, `Slug legacy ${legacySlug} phải redirect 308.`);
    const location = response.headers.get("location") || "";
    assert(location.endsWith(`/tin-tuc/danh-muc/${normalizedSlug}`), `Redirect ${legacySlug} sai đích: ${location}`);
  }

  const category = await prisma.newsCategory.create({
    data: {
      name: "QA SEO Tin tức",
      slug: `qa-seo-news-${suffix}`,
      description: "Danh mục QA SEO",
      nameEn: "QA SEO News",
      slugEn: `qa-seo-news-en-${suffix}`,
      descriptionEn: "QA SEO category",
      robotsIndex: true,
      robotsFollow: true,
      sortOrder: 9999,
    },
  });
  categoryId = category.id;
  const article = await prisma.newsArticle.create({
    data: {
      title: "QA SEO Article",
      slug: `qa-seo-article-${suffix}`,
      category: category.name,
      categoryId: category.id,
      excerpt: "QA excerpt for SEO regression.",
      content: "QA regression content.",
      imageUrl: "/assets/news-1-derivative.png",
      imageAlt: "QA news image",
      imageCaption: "QA VI image caption",
      status: "PUBLISHED",
      tags: ["qa", "seo"],
      metaTitle: "QA SEO Article",
      metaDescription: "QA article used only for local SEO regression and removed after verification.",
      robotsIndex: true,
      robotsFollow: true,
      publishedAt: new Date(),
    },
  });
  articleId = article.id;
  const enSlug = `qa-seo-article-en-${suffix}`;
  await prisma.translationEntry.create({
    data: {
      entityType: "NEWS_ARTICLE",
      entityId: article.id,
      locale: "en",
      slug: enSlug,
      payload: {
        title: "QA SEO Article EN",
        category: "QA SEO News",
        excerpt: "QA English excerpt.",
        content: "QA English content.",
        imageAlt: "QA English image",
        imageCaption: "QA EN image caption",
        metaTitle: "QA SEO Article EN",
        metaDescription: "QA English metadata.",
        tags: ["qa", "seo"],
      },
      sourceUpdatedAt: article.updatedAt,
      sourceHash: `qa-${suffix}`,
      status: "FAILED",
      provider: "qa-regression",
      errorMessage: "Expected QA failure",
    },
  });

  const failedVi = await fetch(`${baseUrl}/tin-tuc/${article.slug}`, { cache: "no-store" });
  const failedViHtml = await failedVi.text();
  assert.equal(failedVi.status, 200);
  assert(!failedViHtml.includes(`/en/news/${enSlug}`), "Bản dịch FAILED không được xuất hiện trong hreflang bài VI.");
  const failedEn = await fetch(`${baseUrl}/en/news/${enSlug}`, { cache: "no-store" });
  assert.equal(failedEn.status, 404, "Bản dịch FAILED phải trả 404 ở route English.");

  await prisma.translationEntry.update({
    where: { entityType_entityId_locale: { entityType: "NEWS_ARTICLE", entityId: article.id, locale: "en" } },
    data: { status: "TRANSLATED", errorMessage: null, translatedAt: new Date() },
  });

  const [viArticle, enArticle, viCategory, enCategory, sitemap] = await Promise.all([
    fetch(`${baseUrl}/tin-tuc/${article.slug}`, { cache: "no-store" }),
    fetch(`${baseUrl}/en/news/${enSlug}`, { cache: "no-store" }),
    fetch(`${baseUrl}/tin-tuc/danh-muc/${category.slug}`, { cache: "no-store" }),
    fetch(`${baseUrl}/en/news/category/${category.slugEn}`, { cache: "no-store" }),
    fetch(`${baseUrl}/sitemap.xml`, { cache: "no-store" }),
  ]);
  assert.equal(viArticle.status, 200);
  assert.equal(enArticle.status, 200);
  assert.equal(viCategory.status, 200);
  assert.equal(enCategory.status, 200);
  assert.equal(sitemap.status, 200);
  const [viArticleHtml, enArticleHtml, viCategoryHtml, enCategoryHtml, sitemapXml] = await Promise.all([
    viArticle.text(), enArticle.text(), viCategory.text(), enCategory.text(), sitemap.text(),
  ]);
  assert(viArticleHtml.includes(`/en/news/${enSlug}`), "Bài VI thiếu hreflang English khi translation đã TRANSLATED.");
  assert(enArticleHtml.includes("QA EN image caption"), "Trang bài English thiếu caption đã dịch.");
  assert(viCategoryHtml.includes(`/en/news/category/${category.slugEn}`), "Danh mục VI thiếu hreflang English.");
  assert(viCategoryHtml.includes("QA VI image caption"), "Danh mục VI thiếu caption ảnh bài viết.");
  assert(enCategoryHtml.includes("QA EN image caption"), "Danh mục English thiếu caption ảnh bài viết.");
  for (const expected of [category.slug, category.slugEn, article.slug, enSlug]) assert(sitemapXml.includes(expected), `Sitemap thiếu ${expected}.`);
  console.log("NEWS_SEO_REGRESSION_PASS canonical categories legacy-redirects hreflang translation-status captions sitemap");
} finally {
  if (articleId) await prisma.translationEntry.deleteMany({ where: { entityType: "NEWS_ARTICLE", entityId: articleId } });
  if (articleId) await prisma.newsArticle.deleteMany({ where: { id: articleId } });
  if (categoryId) await prisma.newsCategory.deleteMany({ where: { id: categoryId } });
  await prisma.$disconnect();
}
