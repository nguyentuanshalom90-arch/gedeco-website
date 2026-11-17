import HomePage from "./components/home-page";
import { getFeaturedNews } from "@/lib/featured-news";
import { getPublicSiteContent } from "@/lib/site-content-public";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [content, news] = await Promise.all([
    getPublicSiteContent("home", "vi"),
    getFeaturedNews("vi"),
  ]);
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.brand,
    url: absoluteUrl("/"),
    inLanguage: "vi-VN",
  };
  return (
    <>
      <HomePage initialContent={content} initialNews={news} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, "\\u003c") }} />
    </>
  );
}
