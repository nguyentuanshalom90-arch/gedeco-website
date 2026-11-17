import type { Metadata } from "next";
import { SharedContactPage } from "../../lien-he/page";
import { getPublicSiteContent } from "@/lib/site-content-public";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { page, media, translatedKeys } = await getPublicSiteContent("lien-he", "en");
  const hasTranslation = translatedKeys.length > 0;
  const title = hasTranslation && page?.metaTitle ? page.metaTitle : "Contact GEDECO";
  const description = hasTranslation && page?.metaDescription ? page.metaDescription : "Contact GEDECO about products, sourcing and business cooperation.";
  const canonical = absoluteUrl("/en/contact");
  const vi = absoluteUrl("/lien-he");
  const image = media["intro.image"];
  const imageAlt = translatedKeys.includes("intro.image") ? image?.altText || "GEDECO products and trade activities" : "GEDECO products and trade activities";
  return { title, description, alternates: { canonical, languages: { vi, en: canonical, "x-default": vi } }, robots: { index: page?.robotsIndex ?? true, follow: page?.robotsFollow ?? true }, openGraph: { type: "website", locale: "en_US", siteName: siteConfig.brand, url: canonical, title, description, images: image ? [{ url: absoluteUrl(image.url), alt: imageAlt }] : undefined } };
}

export default function ContactPageEnglish() { return <SharedContactPage language="en" />; }
