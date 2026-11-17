import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerPage } from "@/app/components/inner-pages";
import { SitePageRenderer } from "@/app/components/site-page-renderer";
import { getPublicSitePage } from "@/lib/site-pages";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export default async function DynamicEnglishPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublicSitePage(slug, "en");
  if (!page) notFound();
  const canonical = absoluteUrl(`/en/pages/${slug}`);
  const jsonLd = [{ "@context": "https://schema.org", "@type": "WebPage", name: page.title, description: page.metaDescription, url: canonical, inLanguage: "en", isPartOf: { "@type": "WebSite", name: siteConfig.brand, url: siteConfig.officialUrl } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en") }, { "@type": "ListItem", position: 2, name: page.title, item: canonical }] }];
  return <InnerPage language="en" active="home"><SitePageRenderer page={page} language="en" /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /></InnerPage>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const page = await getPublicSitePage(slug, "en");
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } };
  const canonical = absoluteUrl(`/en/pages/${slug}`);
  const vi = absoluteUrl(`/pages/${slug}`);
  const image = page.sections.find((section) => section.imageUrl)?.imageUrl;
  return { title: page.metaTitle, description: page.metaDescription, alternates: { canonical, languages: { vi, en: canonical, "x-default": vi } }, robots: { index: page.robotsIndex, follow: page.robotsFollow }, openGraph: { type: "website", locale: "en_US", siteName: siteConfig.brand, url: canonical, title: page.metaTitle, description: page.metaDescription, images: image ? [{ url: absoluteUrl(image), alt: page.sections.find((section) => section.imageUrl)?.imageAlt || page.title }] : undefined }, twitter: { card: "summary_large_image", title: page.metaTitle, description: page.metaDescription, images: image ? [absoluteUrl(image)] : undefined } };
}
