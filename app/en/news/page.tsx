import type { Metadata } from "next";
import { NewsListingPage } from "../../components/news-listing-page";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { getPublicSiteContent } from "@/lib/site-content-public";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { page, translatedKeys } = await getPublicSiteContent("tin-tuc", "en");
  const translated = translatedKeys.length > 0;
  const title = translated && page?.metaTitle ? page.metaTitle : "News & insights | GEDECO";
  const description = translated && page?.metaDescription ? page.metaDescription : "Market updates, Vietnamese products and cooperation opportunities from GEDECO.";
  const canonical = absoluteUrl("/en/news");
  const vi = absoluteUrl("/tin-tuc");
  return { title, description, alternates: { canonical, languages: { vi, en: canonical, "x-default": vi } }, robots: { index: page?.robotsIndex ?? true, follow: page?.robotsFollow ?? true }, openGraph: { type: "website", locale: "en_US", siteName: siteConfig.brand, url: canonical, title, description } };
}

export default function EnglishNewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <NewsListingPage language="en" searchParams={searchParams} />;
}
