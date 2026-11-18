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
import { getPublicSiteContent } from "@/lib/site-content-public";
import { optimizedStaticMediaUrl } from "@/lib/static-media";

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
  const canonical = absoluteUrl(category.canonicalUrl || `/tin-tuc/danh-muc/${category.slug}`);
  const englishCanonical = category.slugEn && category.nameEn
    ? absoluteUrl(category.canonicalUrlEn || `/en/news/category/${category.slugEn}`)
    : null;
  return {
    title,
    description,
    alternates: { canonical, languages: englishCanonical ? { vi: canonical, en: englishCanonical, "x-default": canonical } : { vi: canonical, "x-default": canonical } },
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
  const content = await getPublicSiteContent("tin-tuc", "vi");
  const text = (key: string, fallback: string) => content.values[key] || content.staticValues[key] || fallback;
  const cta = content.media["cta.image"];
  const canonical = absoluteUrl(category.canonicalUrl || `/tin-tuc/danh-muc/${category.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.metaTitle || category.name,
      description:
        category.metaDescription || category.description || undefined,
      url: canonical,
      inLanguage: "vi-VN",
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
    <InnerPage active="Tin tức" alternateEnglishPath={category.slugEn ? `/en/news/category/${category.slugEn}` : null}>
      <InnerHero
        eyebrow={text("category.hero.eyebrow", "DANH MỤC BÀI VIẾT")}
        title={category.name}
        subtitle={
          category.description || text("category.hero.subtitle", `Những thông tin mới nhất thuộc chủ đề ${category.name}.`)
        }
      />
      <section className="inner-news-list">
        <div className="container">
          <div className="inner-title">
            <p className="eyebrow gold-text">{text("category.list.eyebrow", "BÀI VIẾT MỚI NHẤT")}</p>
            <h2>{category.name}</h2>
          </div>
          <div className="inner-news-grid">
            {articles.length ? (
              articles.map((article) => (
                <NewsCard
                  key={article.id}
                  href={`/tin-tuc/${article.slug}`}
                  item={[
                    optimizedStaticMediaUrl(article.imageUrl) || "/assets/news-1.optimized.webp",
                    article.category.toLocaleUpperCase("vi"),
                    (
                      article.publishedAt ||
                      article.scheduledAt ||
                      article.createdAt
                    ).toLocaleDateString("vi-VN"),
                    article.title,
                  ]}
                  imageAlt={article.imageAlt || article.title}
                  imageCaption={article.imageCaption || ""}
                  readLabel={text("list.readLabel", "Đọc thêm")}
                />
              ))
            ) : (
              <p>{text("list.empty", "Danh mục này chưa có bài viết đã xuất bản.")}</p>
            )}
          </div>
        </div>
      </section>
      <CTA
        eyebrow={text("cta.eyebrow", "LIÊN HỆ VỚI GEDECO")}
        title={text("cta.title", "Kết nối cùng GEDECO")}
        text={text("cta.body", "Liên hệ với chúng tôi để trao đổi về cơ hội hợp tác và giải pháp phù hợp.")}
        image={cta?.url}
        imageAlt={cta?.altText}
        imageCaption={cta?.caption}
        primaryLabel={text("cta.primaryLabel", "Liên hệ ngay")}
        secondaryLabel={text("cta.secondaryLabel", "Gửi yêu cầu tư vấn")}
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
