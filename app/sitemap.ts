import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([
    prisma.newsArticle.findMany({
      where: {
        robotsIndex: true,
        OR: [
          { status: "PUBLISHED" },
          { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
        ],
      },
      select: { slug: true, updatedAt: true },
    }),
    prisma.newsCategory.findMany({
      where: { robotsIndex: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);
  const pages = [
    "",
    "/gioi-thieu",
    "/doi-tac",
    "/du-an",
    "/tin-tuc",
    "/lien-he",
  ].map((path, index) => ({
    url: absoluteUrl(path || "/"),
    lastModified: new Date(),
    changeFrequency: index === 0 ? ("weekly" as const) : ("monthly" as const),
    priority: index === 0 ? 1 : path === "/tin-tuc" ? 0.9 : 0.8,
  }));
  return [
    ...pages,
    ...categories.map((item) => ({
      url: absoluteUrl(`/tin-tuc/danh-muc/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((item) => ({
      url: absoluteUrl(`/tin-tuc/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
