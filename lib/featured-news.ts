import { prisma } from "@/lib/prisma";
import { listEnglishArticles, visibleArticleWhere } from "@/lib/public-news";
import { optimizedStaticMediaUrl } from "@/lib/static-media";

export type FeaturedNewsItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
};

export async function getFeaturedNews(language: "vi" | "en"): Promise<FeaturedNewsItem[]> {
  if (language === "en") {
    return (await listEnglishArticles()).slice(0, 3).map((article) => ({
      id: article.source.id,
      title: article.title,
      category: article.category,
      date: (article.source.publishedAt || article.source.scheduledAt || article.source.createdAt).toLocaleDateString("en-GB"),
      href: `/en/news/${article.slug}`,
    imageUrl: article.source.imageUrl || "/assets/news-1.optimized.webp",
      imageAlt: article.imageAlt,
      imageCaption: article.imageCaption,
    }));
  }

  const articles = await prisma.newsArticle.findMany({
    where: visibleArticleWhere(),
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
  });

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    category: article.category,
    date: (article.publishedAt || article.scheduledAt || article.createdAt).toLocaleDateString("vi-VN"),
    href: `/tin-tuc/${article.slug}`,
    imageUrl: optimizedStaticMediaUrl(article.imageUrl) || "/assets/news-1.optimized.webp",
    imageAlt: article.imageAlt || article.title,
    imageCaption: article.imageCaption || "",
  }));
}
