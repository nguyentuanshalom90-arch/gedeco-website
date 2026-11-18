import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Icon, InnerPage } from "../../../components/inner-pages";
import { getEnglishArticleBySlug, listEnglishArticles } from "@/lib/public-news";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { ArticleContent } from "@/app/components/article-content";
import { redirectDestination } from "@/lib/url-redirects";
import { optimizedStaticMediaUrl } from "@/lib/static-media";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getEnglishArticleBySlug(slug);
  if (!article) return { title: "Article not found", robots: { index: false, follow: false } };
  const canonical = absoluteUrl(`/en/news/${article.slug}`);
  const vi = absoluteUrl(`/tin-tuc/${article.source.slug}`);
  const image = optimizedStaticMediaUrl(article.source.ogImageUrl || article.source.imageUrl);
  return {
    title: article.metaTitle,
    description: article.metaDescription || siteConfig.defaultDescription,
    keywords: article.tags,
    authors: article.source.authorName ? [{ name: article.source.authorName }] : undefined,
    alternates: { canonical, languages: { vi, en: canonical, "x-default": vi } },
    robots: { index: article.source.robotsIndex, follow: article.source.robotsFollow },
    openGraph: { type: "article", locale: "en_US", siteName: siteConfig.brand, url: canonical, title: article.metaTitle, description: article.metaDescription, publishedTime: article.source.publishedAt?.toISOString(), modifiedTime: article.source.updatedAt.toISOString(), images: image ? [{ url: absoluteUrl(image), alt: article.ogImageAlt }] : undefined },
    twitter: { card: "summary_large_image", title: article.metaTitle, description: article.metaDescription, images: image ? [absoluteUrl(image)] : undefined },
  };
}

export default async function EnglishArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getEnglishArticleBySlug(slug);
  if (!article) {
    const destination = await redirectDestination(`/en/news/${slug}`);
    if (destination) permanentRedirect(destination);
    notFound();
  }
  const related = (await listEnglishArticles()).filter((item) => item.source.id !== article.source.id).slice(0, 3);
  const published = article.source.publishedAt || article.source.scheduledAt || article.source.createdAt;
  const canonical = absoluteUrl(`/en/news/${article.slug}`);
  const vi = absoluteUrl(`/tin-tuc/${article.source.slug}`);
  const image = article.source.ogImageUrl || article.source.imageUrl;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.metaDescription || article.excerpt || undefined, image: image ? [absoluteUrl(image)] : undefined, datePublished: published.toISOString(), dateModified: article.source.updatedAt.toISOString(), inLanguage: "en", author: { "@type": "Organization", name: article.source.authorName || siteConfig.brand }, publisher: { "@type": "Organization", name: siteConfig.brand, logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig.logo) } }, mainEntityOfPage: canonical, keywords: article.tags.join(", ") }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en") }, { "@type": "ListItem", position: 2, name: "News", item: absoluteUrl("/en/news") }, { "@type": "ListItem", position: 3, name: article.title, item: canonical }] }];
  return <InnerPage active="News" language="en" pageClass="article-design" alternateVietnamesePath={`/tin-tuc/${article.source.slug}`}>
    <section className="article-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(3,25,54,.88),rgba(3,25,54,.28)),url('${optimizedStaticMediaUrl(article.source.imageUrl) || "/assets/banner-1.optimized.webp"}')` }}><div className="container">
      <nav className="article-breadcrumb" aria-label="Breadcrumb"><a href="/en">Home</a><span>›</span><a href="/en/news">News</a><span>›</span><span>{article.category}</span></nav>
      <p className="eyebrow">{article.category.toLocaleUpperCase("en")}</p><h1>{article.title}</h1>
      <div className="article-meta"><span>▣ {published.toLocaleDateString("en-GB")}</span><span>◉ {article.source.authorName || siteConfig.brand}</span><span>Share:</span><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><Icon name="facebook" /></a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"><Icon name="linkedin" /></a></div>
    </div></section>
    <article className="article-layout"><div className="container article-grid"><div className="article-main">
      {article.excerpt && <p className="article-lead">{article.excerpt}</p>}
      {article.source.imageUrl && <figure><img className="article-cover" src={optimizedStaticMediaUrl(article.source.imageUrl)} alt={article.imageAlt} />{article.imageCaption && <figcaption>{article.imageCaption}</figcaption>}</figure>}
      <ArticleContent content={article.content} emptyText="This article is being updated." />
      {article.tags.length > 0 && <div className="article-tags"><strong>Keywords:</strong>{article.tags.map((tag) => <a key={tag} href={`/en/news?tag=${encodeURIComponent(tag)}`}>#{tag}</a>)}</div>}
    </div><aside className="article-side"><div className="side-box"><h3>Related articles</h3>{related.map((item) => <a className="article-related-item" key={item.source.id} href={`/en/news/${item.slug}`}><img src={optimizedStaticMediaUrl(item.source.imageUrl) || "/assets/news-1.optimized.webp"} alt={item.imageAlt} /><span><b>{item.title}</b><small>{(item.source.publishedAt || item.source.scheduledAt || item.source.createdAt).toLocaleDateString("en-GB")}</small></span></a>)}</div></aside></div>
      <div className="container article-nav"><a href="/en/news">← <span>News</span><b>Back to all articles</b></a><a href={vi}><span>Vietnamese version</span><b>Đọc bản tiếng Việt</b> →</a></div>
    </article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
  </InnerPage>;
}
