import type { Metadata } from 'next';
import SharedAboutPage from '../../components/about-page';
import { getPublicSiteContent } from '@/lib/site-content-public';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { page, media, translatedKeys } = await getPublicSiteContent('gioi-thieu', 'en');
  const hasTranslation = translatedKeys.length > 0;
  const title = hasTranslation && page?.metaTitle ? page.metaTitle : 'About GEDECO';
  const description = hasTranslation && page?.metaDescription ? page.metaDescription : 'GEDECO is a Vietnamese trade and export partner.';
  const canonical = absoluteUrl('/en/about');
  const vi = absoluteUrl('/gioi-thieu');
  const image = media['intro.image'];
  const imageAlt = translatedKeys.includes('intro.image') ? image?.altText || 'GEDECO activities' : 'GEDECO activities';
  return { title, description, alternates: { canonical, languages: { vi, en: canonical, 'x-default': vi } }, robots: { index: page?.robotsIndex ?? true, follow: page?.robotsFollow ?? true }, openGraph: { type: 'website', locale: 'en_US', siteName: siteConfig.brand, url: canonical, title, description, images: image ? [{ url: absoluteUrl(image.url), alt: imageAlt }] : undefined } };
}

export default function AboutPageEnglish() {
  return <SharedAboutPage language="en" />;
}
