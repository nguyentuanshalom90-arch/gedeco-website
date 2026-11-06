import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./dashboard/bimi-dashboard.css";
import { siteConfig } from "@/lib/site-config";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.officialUrl),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.brand}`,
  },
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.brand,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.brand,
    url: siteConfig.officialUrl,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [{ url: siteConfig.logo, alt: siteConfig.brand }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [siteConfig.logo],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
    <html lang="vi">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <a className="skip-link" href="#main-content">
          Bỏ qua đến nội dung chính
        </a>
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
