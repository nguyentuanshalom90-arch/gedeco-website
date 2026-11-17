import type { Metadata } from "next";
import { headers } from "next/headers";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./shop-brand.css";
import "./footer-spacing.css";
import "./dashboard/bimi-dashboard.css";
import { siteConfig } from "@/lib/site-config";
import { getPublicSiteContent } from "@/lib/site-content-public";
import { LanguageAwareSkipLink } from "./components/language-aware-skip-link";

const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { page, media } = await getPublicSiteContent("home", "vi");
  const title = page?.metaTitle || siteConfig.defaultTitle;
  const description = page?.metaDescription || siteConfig.defaultDescription;
  const canonical = page?.canonicalUrl || "/";
  const image = media["hero.banner1"];
  const imageUrl = image?.url || siteConfig.logo;
  const imageAlt = image?.altText || siteConfig.brand;
  return { metadataBase: new URL(siteConfig.officialUrl), title: { default: title, template: `%s | ${siteConfig.brand}` }, description, applicationName: siteConfig.brand, alternates: { canonical, languages: { vi: "/", en: "/en", "x-default": "/" } }, robots: { index: page?.robotsIndex ?? true, follow: page?.robotsFollow ?? true }, openGraph: { type: "website", locale: siteConfig.locale, siteName: siteConfig.brand, url: canonical, title, description, images: [{ url: imageUrl, alt: imageAlt }] }, twitter: { card: "summary_large_image", title, description, images: [imageUrl] } };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const language = (await headers()).get("x-gedeco-language") === "en" ? "en" : "vi";
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.brand,
    url: siteConfig.officialUrl,
    logo: new URL(siteConfig.logo, siteConfig.officialUrl).toString(),
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressCountry: "VN",
    },
  };
  return (
    <html lang={language}>
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <LanguageAwareSkipLink />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
