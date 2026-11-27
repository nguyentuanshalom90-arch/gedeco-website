import type { Metadata } from "next";
import { SharedContactPage } from "../components/SharedContactPage";
import { getPublicSiteContent } from "@/lib/site-content-public";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { page, media } = await getPublicSiteContent("lien-he", "vi");
  const title = page?.metaTitle || "Liên hệ GEDECO";
  const description = page?.metaDescription || "Liên hệ GEDECO để được tư vấn nguồn hàng, sản phẩm, xuất khẩu và cơ hội hợp tác thương mại.";
  const canonical = absoluteUrl(page?.canonicalUrl || "/lien-he");
  const image = media["intro.image"];
  return { title, description, alternates: { canonical, languages: { vi: canonical, en: absoluteUrl("/en/contact"), "x-default": canonical } }, robots: { index: page?.robotsIndex ?? true, follow: page?.robotsFollow ?? true }, openGraph: { type: "website", locale: "vi_VN", siteName: siteConfig.brand, url: canonical, title, description, images: image ? [{ url: absoluteUrl(image.url), alt: image.altText }] : undefined } };
}

export default function ContactPage() {
  return <SharedContactPage />;
}
