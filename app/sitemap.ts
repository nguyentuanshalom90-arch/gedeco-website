import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, products, pages, translations] = await Promise.all([
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
    prisma.product.findMany({ where: { isPublished: true, robotsIndex: true }, select: { id: true, slug: true, category: true, updatedAt: true } }),
    prisma.sitePage.findMany({ where: { status: "PUBLISHED", robotsIndex: true }, select: { id: true, slug: true, updatedAt: true } }),
    prisma.translationEntry.findMany({ where: { locale: "en", status: { in: ["TRANSLATED", "NEEDS_REVIEW", "FAILED"] }, slug: { not: null }, entityType: { in: ["PRODUCT", "NEWS_ARTICLE", "SITE_PAGE"] } }, select: { entityType: true, entityId: true, slug: true } }),
  ]);
  const translatedSlug = new Map(translations.map((item) => [`${item.entityType}:${item.entityId}`, item.slug]));
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
    ...products.flatMap((item) => {
      const category = item.category === "EXPORT" ? "xuat-khau" : "trong-nuoc";
      const enCategory = item.category === "EXPORT" ? "export" : "domestic";
      const enSlug = translatedSlug.get(`PRODUCT:${item.id}`) || item.slug;
      const vi = absoluteUrl(`/san-pham/${category}/${item.slug}`); const en = absoluteUrl(`/en/products/${enCategory}/${enSlug}`);
      return [
        { url: vi, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.8, alternates: { languages: { vi, en, "x-default": vi } } },
        { url: en, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.8, alternates: { languages: { vi, en, "x-default": vi } } },
      ];
    }),
    ...pages.flatMap((item) => {
      const enSlug = translatedSlug.get(`SITE_PAGE:${item.id}`) || item.slug;
      const vi = absoluteUrl(`/pages/${item.slug}`); const en = absoluteUrl(`/en/pages/${enSlug}`);
      return [
        { url: vi, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.65, alternates: { languages: { vi, en, "x-default": vi } } },
        { url: en, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.65, alternates: { languages: { vi, en, "x-default": vi } } },
      ];
    }),
  ];
}
