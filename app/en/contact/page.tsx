import type { Metadata } from "next";
import { SharedContactPage } from "../../components/SharedContactPage";
import { getPublicSiteContent } from "@/lib/site-content-public";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { page, media, translatedKeys } = await getPublicSiteContent("lien-he", "en");
  const hasTranslation = translatedKeys.length > 0;
  const title = hasTranslation && page?.metaTitle ? page.metaTitle : "Contact GEDECO";
  const description = hasTranslation && page?.metaDescription ? page.metaDescription : "Contact GEDECO for reliable source connection, products, export trade, and sustainable cooperation.";
  const canonical = absoluteUrl("/en/contact");
  const image = media["intro.image"];
  return { title, description, alternates: { canonical, languages: { vi: absoluteUrl("/lien-he"), en: canonical, "x-default": absoluteUrl("/lien-he") } }, robots: { index: page?.robotsIndex ?? true, follow: page?.robotsFollow ?? true }, openGraph: { type: "website", locale: "en_US", siteName: siteConfig.brand, url: canonical, title, description, images: image ? [{ url: absoluteUrl(image.url), alt: image.altText }] : undefined } };
}

export default function ContactPageEnglish() {
  return <SharedContactPage language="en" />;
}
