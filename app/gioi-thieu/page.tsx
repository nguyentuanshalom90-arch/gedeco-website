import type { Metadata } from 'next';
import SharedAboutPage from '../components/about-page';
import { getPublicSiteContent } from '@/lib/site-content-public';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { page, media } = await getPublicSiteContent('gioi-thieu', 'vi');
  const title = page?.metaTitle || 'Giới thiệu GEDECO';
  const description = page?.metaDescription || 'Giới thiệu Công ty Cổ phần GEDECO, các lĩnh vực hoạt động và giá trị theo đuổi.';
  const canonical = absoluteUrl(page?.canonicalUrl || '/gioi-thieu');
  const image = media['intro.image'];
  return { title, description, alternates: { canonical, languages: { vi: canonical, en: absoluteUrl('/en/about'), 'x-default': canonical } }, robots: { index: page?.robotsIndex ?? true, follow: page?.robotsFollow ?? true }, openGraph: { type: 'website', locale: 'vi_VN', siteName: siteConfig.brand, url: canonical, title, description, images: image ? [{ url: absoluteUrl(image.url), alt: image.altText }] : undefined } };
}

export default function AboutPage() {
  return <SharedAboutPage />;
}
