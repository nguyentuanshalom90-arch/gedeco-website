import {
  CTA,
  Icon,
  InnerHero,
  InnerPage,
  NewsCard,
} from "../components/inner-pages";
import { innerNews } from "../data";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { getPublicSiteContent } from "@/lib/site-content-public";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Tin tức",
  description:
    "Cập nhật tin thị trường, cơ hội hợp tác, hoạt động xuất khẩu và logistics quốc tế từ GEDECO.",
  alternates: { canonical: "/tin-tuc" },
  openGraph: {
    type: "website",
    url: "/tin-tuc",
    title: "Tin tức GEDECO",
    description: "Cập nhật xu hướng thị trường, hợp tác và logistics quốc tế.",
  },
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ trang?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.trang || "1", 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 9;
  const [articles, categories, content] = await Promise.all([
    prisma.newsArticle.findMany({
      where: {
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
      take: 100,
    }),
    prisma.newsCategory.findMany({
      where: { robotsIndex: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getPublicSiteContent("tin-tuc"),
  ]);
  const cmsItemsAll = articles.map((article) => ({
    item: [
      article.imageUrl || "/assets/news-1-derivative.png",
      article.category.toLocaleUpperCase("vi"),
      (
        article.publishedAt ||
        article.scheduledAt ||
        article.createdAt
      ).toLocaleDateString("vi-VN"),
      article.title,
    ],
    href: `/tin-tuc/${article.slug}`,
    excerpt: article.excerpt || "",
  }));
  const fallbackItems = innerNews.concat(innerNews).map((item, index) => ({
    item: [item[0], item[1], item[2], index < innerNews.length ? item[3] : [
      "Logistics xanh – Xu hướng tất yếu hướng tới phát triển bền vững",
      "Triển vọng thương mại toàn cầu năm 2025",
      "GEDECO đồng hành cùng doanh nghiệp xuất khẩu mở rộng thị trường",
    ][index - innerNews.length] || item[3]],
    href: "/tin-tuc/chi-tiet",
    excerpt: "Cập nhật những chuyển động mới của thị trường và các giải pháp giúp doanh nghiệp nâng cao năng lực cạnh tranh.",
  }));
  const fallbackOnly = fallbackItems.filter(({ item }) => !cmsItemsAll.some(({ item: cmsItem }) => cmsItem[3] === item[3]));
  const allItems = cmsItemsAll.length ? [...cmsItemsAll, ...fallbackOnly] : fallbackItems;
  const pageCount = Math.max(1, Math.ceil(allItems.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const displayItems = allItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  return (
    <InnerPage active="Tin tức" pageClass="news-design">
      <InnerHero
        eyebrow="TIN TỨC & CHIA SẺ"
        title={content.values["hero.title"] || "Cập nhật xu hướng, kết nối cơ hội"}
        subtitle={content.values["hero.subtitle"] || "Những thông tin mới nhất về thị trường, hợp tác và hoạt động của GEDECO."}
      />
      <section className="inner-news-list">
        <div className="container">
          <div className="inner-title">
            <p className="eyebrow gold-text">TIN MỚI NHẤT</p>
            <h2>Thông tin đáng chú ý</h2>
          </div>
          <nav className="news-filters" aria-label="Danh mục bài viết">
            <a className="active" href="/tin-tuc">
              Tất cả
            </a>
            {categories.map((category) => (
              <a key={category.id} href={`/tin-tuc/danh-muc/${category.slug}`}>
                {category.name}
              </a>
            ))}
          </nav>
          <div className="news-three-column-grid">
            {displayItems.map(({ item, href, excerpt }, index) => (
              <NewsCard key={`${href}-${index}`} item={item} href={href} excerpt={excerpt} />
            ))}
          </div>
          {pageCount > 1 && <nav className="news-pagination" aria-label="Phân trang tin tức">{safePage > 1 && <a href={`/tin-tuc?trang=${safePage - 1}`}>← Trang trước</a>}<span>Trang {safePage} / {pageCount}</span>{safePage < pageCount && <a href={`/tin-tuc?trang=${safePage + 1}`}>Trang sau →</a>}</nav>}
        </div>
      </section>
      <CTA
        title="Đừng bỏ lỡ những cơ hội mới"
        text="Đăng ký nhận thông tin từ GEDECO để luôn cập nhật những chuyển động quan trọng của thị trường."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Tin tức GEDECO",
            description: metadata.description,
            url: absoluteUrl("/tin-tuc"),
            isPartOf: {
              "@type": "WebSite",
              name: siteConfig.brand,
              url: siteConfig.officialUrl,
            },
          }).replace(/</g, "\\u003c"),
        }}
      />
    </InnerPage>
  );
}
import type { Metadata } from "next";
