import type { Metadata } from "next";
import { CTA, InnerHero, InnerPage, NewsCard } from "../../components/inner-pages";
import { prisma } from "@/lib/prisma";
import { listEnglishArticles } from "@/lib/public-news";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "News & insights",
  description: "Market updates, Vietnamese products and cooperation opportunities from GEDECO.",
  alternates: { canonical: "/en/news", languages: { vi: "/tin-tuc", en: "/en/news", "x-default": "/tin-tuc" } },
  openGraph: { type: "website", locale: "en_US", url: "/en/news", title: "News & insights | GEDECO", description: "Market updates, Vietnamese products and cooperation opportunities from GEDECO." },
};

export default async function EnglishNewsPage({ searchParams }: { searchParams: Promise<{ page?: string; trang?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page || params.trang || "1", 10);
  const pageSize = 9;
  const [articles, categories] = await Promise.all([
    listEnglishArticles(),
    prisma.newsCategory.findMany({ where: { robotsIndex: true, nameEn: { not: null }, slugEn: { not: null } }, orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }] }),
  ]);
  const pageCount = Math.max(1, Math.ceil(articles.length / pageSize));
  const safePage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pageCount) : 1;
  const pageItems = articles.slice((safePage - 1) * pageSize, safePage * pageSize);
  return <InnerPage active="News" language="en" pageClass="news-design">
    <InnerHero eyebrow="NEWS & INSIGHTS" title="GEDECO news" subtitle="Market updates, Vietnamese products and cooperation opportunities" />
    <section className="inner-news-list"><div className="container">
      <div className="inner-title"><p className="eyebrow gold-text">LATEST UPDATES</p><h2>Information for better cooperation</h2></div>
      <nav className="news-filters" aria-label="Article categories"><a className="active" href="/en/news">All</a>{categories.map((category) => <a key={category.id} href={`/en/news/category/${category.slugEn}`}>{category.nameEn}</a>)}</nav>
      {pageItems.length ? <div className="news-three-column-grid">{pageItems.map((article) => <NewsCard key={article.source.id} item={[article.source.imageUrl || "/assets/news-1-derivative.png", article.category, (article.source.publishedAt || article.source.scheduledAt || article.source.createdAt).toLocaleDateString("en-GB"), article.title]} imageAlt={article.imageAlt} excerpt={article.excerpt} href={`/en/news/${article.slug}`} readLabel="Read more" />)}</div> : <p>No English articles have been published yet.</p>}
      {pageCount > 1 && <nav className="news-pagination" aria-label="News pagination">{safePage > 1 && <a href={`/en/news?page=${safePage - 1}`}>← Previous</a>}<span>Page {safePage} / {pageCount}</span>{safePage < pageCount && <a href={`/en/news?page=${safePage + 1}`}>Next →</a>}</nav>}
    </div></section>
    <CTA language="en" title="Do not miss new opportunities" text="Stay connected with GEDECO and follow important market developments." />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: "GEDECO news", description: metadata.description, url: absoluteUrl("/en/news"), inLanguage: "en", isPartOf: { "@type": "WebSite", name: siteConfig.brand, url: siteConfig.officialUrl } }).replace(/</g, "\\u003c") }} />
  </InnerPage>;
}
