import { notFound } from "next/navigation";
import { InnerPage } from "@/app/components/inner-pages";
import { SitePageRenderer } from "@/app/components/site-page-renderer";
import { getPublicSitePage } from "@/lib/site-pages";

export default async function DynamicVietnamesePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublicSitePage(slug, "vi");
  if (!page) notFound();
  return <InnerPage language="vi" active="home"><SitePageRenderer page={page} language="vi" /></InnerPage>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const page = await getPublicSitePage((await params).slug, "vi");
  return page ? { title: page.metaTitle, description: page.metaDescription } : {};
}
