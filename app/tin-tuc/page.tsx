import type { Metadata } from "next";
import { NewsListingPage } from "../components/news-listing-page";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { getPublicSiteContent } from "@/lib/site-content-public";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getPublicSiteContent("tin-tuc", "vi");
  const title = page?.metaTitle || "Tin tức GEDECO";
  const description = page?.metaDescription || "Cập nhật hoạt động thương mại, nguồn hàng, sản phẩm và cơ hội hợp tác cùng GEDECO.";
  const canonical = absoluteUrl("/tin-tuc");
  return { title, description, alternates: { canonical, languages: { vi: canonical, en: absoluteUrl("/en/news"), "x-default": canonical } }, robots: { index: page?.robotsIndex ?? true, follow: page?.robotsFollow ?? true }, openGraph: { type: "website", locale: siteConfig.locale, siteName: siteConfig.brand, url: canonical, title, description } };
}

export default function NewsPage({ searchParams }: { searchParams: Promise<{ trang?: string }> }) {
  return <NewsListingPage searchParams={searchParams} />;
}
