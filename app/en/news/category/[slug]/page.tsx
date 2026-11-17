import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CTA, InnerHero, InnerPage, NewsCard } from "../../../../components/inner-pages";
import { prisma } from "@/lib/prisma";
import { listEnglishArticles } from "@/lib/public-news";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  return prisma.newsCategory.findFirst({ where: { slugEn: slug, nameEn: { not: null } } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "News category not found", robots: { index: false, follow: false } };
  const canonical = absoluteUrl(category.canonicalUrlEn || `/en/news/category/${category.slugEn}`);
  const vi = absoluteUrl(category.canonicalUrl || `/tin-tuc/danh-muc/${category.slug}`);
  const title = category.metaTitleEn || category.nameEn || "News";
  const description = category.metaDescriptionEn || category.descriptionEn || `Latest ${category.nameEn} articles from GEDECO.`;
  return {
    title,
    description,
    alternates: { canonical, languages: { vi, en: canonical, "x-default": vi } },
    robots: { index: category.robotsIndex, follow: category.robotsFollow },
    openGraph: { type: "website", locale: "en_US", siteName: siteConfig.brand, url: canonical, title, description },
  };
}

export default async function EnglishNewsCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category?.nameEn || !category.slugEn) notFound();
  const articles = await listEnglishArticles(category.id);
  const canonical = absoluteUrl(category.canonicalUrlEn || `/en/news/category/${category.slugEn}`);
  const vi = absoluteUrl(category.canonicalUrl || `/tin-tuc/danh-muc/${category.slug}`);
  const jsonLd = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: category.metaTitleEn || category.nameEn, description: category.metaDescriptionEn || category.descriptionEn || undefined, url: canonical, inLanguage: "en", isPartOf: { "@type": "WebSite", name: siteConfig.brand, url: siteConfig.officialUrl } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en") }, { "@type": "ListItem", position: 2, name: "News", item: absoluteUrl("/en/news") }, { "@type": "ListItem", position: 3, name: category.nameEn, item: canonical }] }];
  return <InnerPage active="News" language="en" alternateVietnamesePath={`/tin-tuc/danh-muc/${category.slug}`}>
    <InnerHero eyebrow="NEWS CATEGORY" title={category.nameEn} subtitle={category.descriptionEn || `Latest ${category.nameEn} updates and insights from GEDECO.`} />
    <section className="inner-news-list"><div className="container"><div className="inner-title"><p className="eyebrow gold-text">LATEST UPDATES</p><h2>{category.nameEn}</h2></div>
      {articles.length ? <div className="inner-news-grid">{articles.map((article) => <NewsCard key={article.source.id} item={[article.source.imageUrl || "/assets/news-1-derivative.png", article.category, (article.source.publishedAt || article.source.scheduledAt || article.source.createdAt).toLocaleDateString("en-GB"), article.title]} imageAlt={article.imageAlt} imageCaption={article.imageCaption} excerpt={article.excerpt} href={`/en/news/${article.slug}`} readLabel="Read more" />)}</div> : <p>No English articles have been published in this category yet.</p>}
    </div></section>
    <CTA language="en" title="Stay connected with GEDECO" text="Contact us to discuss products, cooperation and market opportunities." />
    <a className="sr-only" href={vi}>Vietnamese version</a>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
  </InnerPage>;
}
