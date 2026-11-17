import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, products, productCategories, pages, translations] = await Promise.all([
    prisma.newsArticle.findMany({
      where: {
        robotsIndex: true,
        OR: [
          { status: "PUBLISHED" },
          { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
        ],
      },
      select: { id: true, slug: true, updatedAt: true },
    }),
    prisma.newsCategory.findMany({
      where: { robotsIndex: true },
      select: { slug: true, slugEn: true, updatedAt: true },
    }),
    prisma.product.findMany({ where: { isPublished: true, robotsIndex: true, category: { isPublished: true } }, select: { id: true, slug: true, category: { select: { slug: true, slugEn: true } }, updatedAt: true } }),
    prisma.productCategory.findMany({ where: { isPublished: true, robotsIndex: true }, select: { slug: true, slugEn: true, updatedAt: true } }),
    prisma.sitePage.findMany({ where: { status: "PUBLISHED", robotsIndex: true }, select: { id: true, slug: true, canonicalUrl: true, updatedAt: true } }),
    prisma.translationEntry.findMany({ where: { locale: "en", status: { in: ["TRANSLATED", "NEEDS_REVIEW", "FAILED"] }, slug: { not: null }, entityType: { in: ["PRODUCT", "NEWS_ARTICLE", "SITE_PAGE"] } }, select: { entityType: true, entityId: true, slug: true, status: true } }),
  ]);
  const translatedSlug = new Map(translations.map((item) => [`${item.entityType}:${item.entityId}`, item.slug]));
  const translatedPages = new Set(translations.filter((item) => item.entityType === "SITE_PAGE" && item.status === "TRANSLATED").map((item) => item.entityId));
  const staticPages = [
    ["/", "/en"], ["/gioi-thieu", "/en/about"], ["/doi-tac", "/en/partners"], ["/du-an", "/en/projects"],
    ["/san-pham", "/en/products"], ["/tin-tuc", "/en/news"], ["/lien-he", "/en/contact"],
    ["/chinh-sach-hang-chinh-hang", "/en/authentic-product-policy"], ["/huong-dan-mua-hang", "/en/how-to-order"],
    ["/giao-hang-va-thanh-toan", "/en/shipping-and-payment"], ["/doi-tra-va-bao-hanh", "/en/returns-and-warranty"],
  ].flatMap(([vi, en], index) => [vi, en].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: index === 0 ? ("weekly" as const) : ("monthly" as const),
    priority: index === 0 ? 1 : ["/tin-tuc", "/en/news", "/san-pham", "/en/products"].includes(path) ? 0.9 : 0.8,
    alternates: { languages: { vi: absoluteUrl(vi), en: absoluteUrl(en), "x-default": absoluteUrl(vi) } },
  })));
  return [
    ...staticPages,
    ...categories.flatMap((item) => {
      const vi = absoluteUrl(`/tin-tuc/danh-muc/${item.slug}`);
      const enSlug = item.slugEn;
      if (!enSlug) return [{ url: vi, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 }];
      const en = absoluteUrl(`/en/news/category/${enSlug}`);
      const alternates = { languages: { vi, en, "x-default": vi } };
      return [{ url: vi, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.7, alternates }, { url: en, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.7, alternates }];
    }),
    ...articles.flatMap((item) => {
      const enSlug = translatedSlug.get(`NEWS_ARTICLE:${item.id}`);
      const vi = absoluteUrl(`/tin-tuc/${item.slug}`);
      if (!enSlug) return [{ url: vi, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.75 }];
      const en = absoluteUrl(`/en/news/${enSlug}`);
      const alternates = { languages: { vi, en, "x-default": vi } };
      return [{ url: vi, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.75, alternates }, { url: en, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.75, alternates }];
    }),
    ...productCategories.flatMap((item) => {
      const vi = absoluteUrl(`/san-pham/${item.slug}`);
      const en = absoluteUrl(`/en/products/${item.slugEn}`);
      const alternates = { languages: { vi, en, "x-default": vi } };
      return [{ url: vi, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.8, alternates }, { url: en, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.8, alternates }];
    }),
    ...products.flatMap((item) => {
      const category = item.category.slug;
      const enCategory = item.category.slugEn;
      const enSlug = translatedSlug.get(`PRODUCT:${item.id}`) || item.slug;
      const vi = absoluteUrl(`/san-pham/${category}/${item.slug}`); const en = absoluteUrl(`/en/products/${enCategory}/${enSlug}`);
      return [
        { url: vi, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.8, alternates: { languages: { vi, en, "x-default": vi } } },
        { url: en, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.8, alternates: { languages: { vi, en, "x-default": vi } } },
      ];
    }),
    ...pages.flatMap((item) => {
      const vi = absoluteUrl(item.canonicalUrl || `/pages/${item.slug}`);
      if (!translatedPages.has(item.id)) return [{ url: vi, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.65 }];
      const enSlug = translatedSlug.get(`SITE_PAGE:${item.id}`) || item.slug;
      const en = absoluteUrl(`/en/pages/${enSlug}`);
      return [
        { url: vi, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.65, alternates: { languages: { vi, en, "x-default": vi } } },
        { url: en, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.65, alternates: { languages: { vi, en, "x-default": vi } } },
      ];
    }),
  ];
}
