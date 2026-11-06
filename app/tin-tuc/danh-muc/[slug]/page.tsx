import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CTA,
  InnerHero,
  InnerPage,
  NewsCard,
} from "../../../components/inner-pages";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

async function categoryBySlug(slug: string) {
  return prisma.newsCategory.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoryBySlug(slug);
  if (!category) return { title: "Không tìm thấy danh mục" };
  const title = category.metaTitle || category.name;
  const description =
    category.metaDescription ||
    category.description ||
    `Các bài viết mới nhất thuộc danh mục ${category.name} từ GEDECO.`;
  const canonical =
    category.canonicalUrl || absoluteUrl(`/tin-tuc/danh-muc/${category.slug}`);
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: category.robotsIndex, follow: category.robotsFollow },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.brand,
      url: canonical,
      title,
      description,
    },
  };
}

export default async function NewsCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await categoryBySlug(slug);
  if (!category) notFound();
  const articles = await prisma.newsArticle.findMany({
    where: {
      categoryId: category.id,
      OR: [
        { status: "PUBLISHED" },
        { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
      ],
    },
    orderBy: [
      { isFeatured: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
  });
  const canonical =
    category.canonicalUrl || absoluteUrl(`/tin-tuc/danh-muc/${category.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.metaTitle || category.name,
      description:
        category.metaDescription || category.description || undefined,
      url: canonical,
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.brand,
        url: siteConfig.officialUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Trang chủ",
          item: siteConfig.officialUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tin tức",
          item: absoluteUrl("/tin-tuc"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: canonical,
        },
      ],
    },
  ];
  return (
    <InnerPage active="Tin tức">
      <InnerHero
        eyebrow="DANH MỤC BÀI VIẾT"
        title={category.name}
        subtitle={
          category.description ||
          `Những thông tin mới nhất thuộc chủ đề ${category.name}.`
        }
      />
      <section className="inner-news-list">
        <div className="container">
          <div className="inner-title">
            <p className="eyebrow gold-text">BÀI VIẾT MỚI NHẤT</p>
            <h2>{category.name}</h2>
          </div>
          <div className="inner-news-grid">
            {articles.length ? (
              articles.map((article) => (
                <NewsCard
                  key={article.id}
                  href={`/tin-tuc/${article.slug}`}
                  item={[
                    article.imageUrl || "/assets/news-1-derivative.png",
                    article.category.toLocaleUpperCase("vi"),
                    (
                      article.publishedAt ||
                      article.scheduledAt ||
                      article.createdAt
                    ).toLocaleDateString("vi-VN"),
                    article.title,
                  ]}
                />
              ))
            ) : (
              <p>Danh mục này chưa có bài viết đã xuất bản.</p>
            )}
          </div>
        </div>
      </section>
      <CTA
        title="Kết nối cùng GEDECO"
        text="Liên hệ với chúng tôi để trao đổi về cơ hội hợp tác và giải pháp phù hợp."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </InnerPage>
  );
}
