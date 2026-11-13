import { notFound } from "next/navigation";
import { InnerPage } from "@/app/components/inner-pages";
import { SitePageRenderer } from "@/app/components/site-page-renderer";
import { getPublicSitePage } from "@/lib/site-pages";

export default async function DynamicEnglishPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublicSitePage(slug, "en");
  if (!page) notFound();
  return <InnerPage language="en" active="home"><SitePageRenderer page={page} language="en" /></InnerPage>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const page = await getPublicSitePage((await params).slug, "en");
  return page ? { title: page.metaTitle, description: page.metaDescription } : {};
}
