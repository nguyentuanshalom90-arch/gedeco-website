import { CTA, InnerHero, InnerPage, NewsCard } from "./inner-pages";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { getPublicSiteContent } from "@/lib/site-content-public";
import { listEnglishArticles } from "@/lib/public-news";

export const dynamic = "force-dynamic";

type Language = "vi" | "en";
type ListingSearchParams = Promise<{ trang?: string; page?: string }>;

const fallback = {
  vi: { heroEyebrow: "TIN TỨC & CHIA SẺ", heroTitle: "Tin tức GEDECO", heroSubtitle: "Cập nhật nguồn hàng, sản phẩm, hoạt động thương mại và cơ hội hợp tác cùng GEDECO.", listEyebrow: "TIN MỚI NHẤT", listTitle: "Thông tin đáng chú ý", all: "Tất cả", empty: "Chưa có bài viết đã xuất bản.", read: "Đọc thêm", prev: "← Trang trước", next: "Trang sau →", page: "Trang", ctaEyebrow: "LIÊN HỆ VỚI GEDECO", ctaTitle: "Đừng bỏ lỡ những cơ hội mới", ctaBody: "Kết nối với GEDECO để luôn cập nhật những chuyển động quan trọng của thị trường.", ctaPrimary: "Liên hệ ngay", ctaSecondary: "Gửi yêu cầu tư vấn" },
  en: { heroEyebrow: "NEWS & INSIGHTS", heroTitle: "GEDECO news", heroSubtitle: "Updates on Vietnamese products, trade activities and cooperation opportunities.", listEyebrow: "LATEST NEWS", listTitle: "Noteworthy updates", all: "All", empty: "No English articles have been published yet.", read: "Read more", prev: "← Previous page", next: "Next page →", page: "Page", ctaEyebrow: "CONTACT GEDECO", ctaTitle: "Stay ahead of new opportunities", ctaBody: "Connect with GEDECO for important market updates and cooperation opportunities.", ctaPrimary: "Contact us", ctaSecondary: "Send an enquiry" },
} as const;

export async function NewsListingPage({ language = "vi", searchParams }: { language?: Language; searchParams: ListingSearchParams }) {
  const english = language === "en";
  const copy = fallback[language];
  const params = await searchParams;
  const requestedPage = Number.parseInt((english ? params.page : params.trang) || "1", 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 9;
  const [content, categories, viArticles, enArticles] = await Promise.all([
    getPublicSiteContent("tin-tuc", language),
    prisma.newsCategory.findMany({ where: english ? { nameEn: { not: null }, slugEn: { not: null } } : {}, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    english ? Promise.resolve([]) : prisma.newsArticle.findMany({ where: { OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: new Date() } }] }, orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }], take: 100 }),
    english ? listEnglishArticles() : Promise.resolve([]),
  ]);
  const translated = new Set(content.translatedKeys);
  const text = (key: string, fallbackValue: string) => english ? (translated.has(key) ? content.values[key] || content.staticValues[key] || fallbackValue : fallbackValue) : content.values[key] || content.staticValues[key] || fallbackValue;
  const media = (key: string, fallbackUrl: string, viAlt: string, enAlt: string) => {
    const item = content.media[key];
    const localized = !english || translated.has(key);
    return { url: item?.url || fallbackUrl, alt: localized ? item?.altText || (english ? enAlt : viAlt) : enAlt, caption: localized ? item?.caption || "" : "" };
  };
  const items = english
    ? enArticles.map((article) => ({ id: article.source.id, image: article.source.imageUrl || "/assets/news-1-derivative.png", category: article.category, date: (article.source.publishedAt || article.source.scheduledAt || article.source.createdAt).toLocaleDateString("en-GB"), title: article.title, href: `/en/news/${article.slug}`, excerpt: article.excerpt, imageAlt: article.imageAlt, imageCaption: article.imageCaption }))
    : viArticles.map((article) => ({ id: article.id, image: article.imageUrl || "/assets/news-1-derivative.png", category: article.category.toLocaleUpperCase("vi"), date: (article.publishedAt || article.scheduledAt || article.createdAt).toLocaleDateString("vi-VN"), title: article.title, href: `/tin-tuc/${article.slug}`, excerpt: article.excerpt || "", imageAlt: article.imageAlt || article.title, imageCaption: article.imageCaption || "" }));
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const displayItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  const hero = media("hero.image", "/assets/banner-1.jpg", "Tin tức và hoạt động GEDECO", "GEDECO news and activities");
  const cta = media("cta.image", "/assets/footer.jpg", "Kết nối cùng GEDECO", "Connect with GEDECO");
  const listPath = english ? "/en/news" : "/tin-tuc";
  const queryKey = english ? "page" : "trang";
  const canonical = absoluteUrl(listPath);
  const jsonLd = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: english ? "GEDECO News" : "Tin tức GEDECO", url: canonical, inLanguage: english ? "en" : "vi-VN", isPartOf: { "@type": "WebSite", name: siteConfig.brand, url: siteConfig.officialUrl } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: english ? "Home" : "Trang chủ", item: absoluteUrl(english ? "/en" : "/") }, { "@type": "ListItem", position: 2, name: english ? "News" : "Tin tức", item: canonical }] }];
  return <InnerPage active={english ? "News" : "Tin tức"} pageClass="news-design" language={language}>
    <InnerHero eyebrow={text("hero.eyebrow", copy.heroEyebrow)} title={text("hero.title", copy.heroTitle)} subtitle={text("hero.subtitle", copy.heroSubtitle)} image={hero.url} imageAlt={hero.alt} imageCaption={hero.caption} />
    <section className="inner-news-list"><div className="container"><div className="inner-title"><p className="eyebrow gold-text">{text("list.eyebrow", copy.listEyebrow)}</p><h2>{text("list.title", copy.listTitle)}</h2></div>
      <nav className="news-filters" aria-label={english ? "News categories" : "Danh mục bài viết"}><a className="active" href={listPath}>{text("list.allLabel", copy.all)}</a>{categories.map((category) => <a key={category.id} href={english ? `/en/news/category/${category.slugEn}` : `/tin-tuc/danh-muc/${category.slug}`}>{english ? category.nameEn : category.name}</a>)}</nav>
      {displayItems.length ? <div className="news-three-column-grid">{displayItems.map((article) => <NewsCard key={article.id} item={[article.image, article.category, article.date, article.title]} href={article.href} excerpt={article.excerpt} imageAlt={article.imageAlt} imageCaption={article.imageCaption} readLabel={text("list.readLabel", copy.read)} />)}</div> : <p className="news-empty-state">{text("list.empty", copy.empty)}</p>}
      {pageCount > 1 ? <nav className="news-pagination" aria-label={english ? "News pagination" : "Phân trang tin tức"}>{safePage > 1 ? <a href={`${listPath}?${queryKey}=${safePage - 1}`}>{text("list.prevLabel", copy.prev)}</a> : null}<span>{text("list.pageLabel", copy.page)} {safePage} / {pageCount}</span>{safePage < pageCount ? <a href={`${listPath}?${queryKey}=${safePage + 1}`}>{text("list.nextLabel", copy.next)}</a> : null}</nav> : null}
    </div></section>
    <CTA language={language} eyebrow={text("cta.eyebrow", copy.ctaEyebrow)} title={text("cta.title", copy.ctaTitle)} text={text("cta.body", copy.ctaBody)} image={cta.url} imageAlt={cta.alt} imageCaption={cta.caption} primaryLabel={text("cta.primaryLabel", copy.ctaPrimary)} secondaryLabel={text("cta.secondaryLabel", copy.ctaSecondary)} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
  </InnerPage>;
}

