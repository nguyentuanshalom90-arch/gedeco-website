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
  const pageSize = 3;
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
  const pageCount = Math.max(1, Math.ceil(cmsItemsAll.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const cmsItems = cmsItemsAll.slice((safePage - 1) * pageSize, safePage * pageSize);
  const fallbackItems = innerNews.concat(innerNews).map((item, index) => ({
    item: [item[0], item[1], item[2], index < innerNews.length ? item[3] : [
      "Logistics xanh – Xu hướng tất yếu hướng tới phát triển bền vững",
      "Triển vọng thương mại toàn cầu năm 2025",
      "GEDECO đồng hành cùng doanh nghiệp xuất khẩu mở rộng thị trường",
    ][index - innerNews.length] || item[3]],
    href: "/tin-tuc/chi-tiet",
    excerpt: "Cập nhật những chuyển động mới của thị trường và các giải pháp giúp doanh nghiệp nâng cao năng lực cạnh tranh.",
  }));
  const displayItems = (cmsItems.length ? cmsItems : fallbackItems).slice(0, 7);
  const featured = displayItems[0];
  return (
    <InnerPage active="Tin tức" pageClass="news-design">
      <InnerHero
        eyebrow="TIN TỨC & CHIA SẺ"
        title={content.values["hero.title"] || "Cập nhật xu hướng, kết nối cơ hội"}
        subtitle={content.values["hero.subtitle"] || "Những thông tin mới nhất về thị trường, hợp tác và hoạt động của GEDECO."}
      />
      <section className="news-feature">
        <div className="container inner-split">
          <div className="inner-image">
            <img
              src={featured?.item[0] || "/assets/news-1-derivative.png"}
              alt={featured?.item[3] || innerNews[0]?.[3] || ""}
            />
          </div>
          <div>
            <p className="eyebrow gold-text">
              {featured?.item[1] || innerNews[0]?.[1]} ·{" "}
              {featured?.item[2] || innerNews[0]?.[2]}
            </p>
            <h2>{featured?.item[3] || innerNews[0]?.[3]}</h2>
            <p>
              {featured?.excerpt ||
                "Doanh nghiệp Việt đang có thêm nhiều cơ hội tiếp cận thị trường quốc tế. Cùng GEDECO cập nhật xu hướng và chuẩn bị tốt hơn cho hành trình mở rộng kinh doanh."}
            </p>
            <a
              className="button button-gold"
              href={featured?.href || "/tin-tuc/chi-tiet"}
            >
              Đọc chi tiết <Icon name="arrow" />
            </a>
          </div>
        </div>
      </section>
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
          <div className="news-content-layout"><div className="inner-news-grid">
            {displayItems.slice(1).map(({ item, href }, index) => (
              <NewsCard key={`${href}-${index}`} item={item} href={href} />
            ))}
          </div><aside className="news-sidebar"><div className="side-box"><h3>Xu hướng & phân tích nổi bật</h3>{displayItems.slice(1,4).map(({item},index)=><div className="mini-news" key={`${item[3]}-mini-${index}`}><img src={item[0].startsWith('/') ? item[0] : `/assets/${item[0]}`} alt="" /><b>{item[3]}</b></div>)}</div><div className="side-box topic-box"><h3>Tin theo chủ đề</h3>{['Thị trường logistics','Chuỗi cung ứng','Vận tải quốc tế','Kiến thức & chia sẻ','Hoạt động GEDECO'].map((label,index)=><p key={label}><span>{label}</span><b>{[42,28,36,24,18][index]}</b></p>)}</div><div className="market-report"><p className="eyebrow">BÁO CÁO THỊ TRƯỜNG</p><h3>Toàn cảnh Logistics 2025</h3><p>Nhận báo cáo phân tích xu hướng, đánh giá thị trường và khuyến nghị.</p><a className="button button-gold" href="/lien-he">Tải báo cáo ngay</a></div></aside></div>
          {pageCount > 1 && <nav className="news-pagination" aria-label="Phân trang tin tức">{safePage > 1 && <a href={`/tin-tuc?trang=${safePage - 1}`}>← Trang trước</a>}<span>Trang {safePage} / {pageCount}</span>{safePage < pageCount && <a href={`/tin-tuc?trang=${safePage + 1}`}>Trang sau →</a>}</nav>}
        </div>
      </section>
      <section className="news-subscribe"><div className="container"><p className="eyebrow">CẬP NHẬT TIN TỨC TỪ GEDECO</p><h2>Đăng ký nhận bản tin</h2><p>Nhận các bài viết mới nhất về thị trường, xu hướng logistics và giải pháp dành cho doanh nghiệp.</p><form><input type="email" aria-label="Email của bạn" placeholder="Nhập email của bạn" /><button className="button button-gold" type="button">Đăng ký ngay <Icon name="arrow" /></button></form></div></section>
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
