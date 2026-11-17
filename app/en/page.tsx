import type { Metadata } from 'next';
import HomePage from '../components/home-page';
import { getFeaturedNews } from '@/lib/featured-news';
import { getPublicSiteContent } from '@/lib/site-content-public';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { page, media, translatedKeys } = await getPublicSiteContent('home', 'en');
  const translated = translatedKeys.length > 0;
  const title = translated && page?.metaTitle ? page.metaTitle : 'Trade and export from Vietnam';
  const description = translated && page?.metaDescription ? page.metaDescription : 'GEDECO develops Vietnamese sources and connects quality products with international customers and partners.';
  const canonical = absoluteUrl('/en');
  const vi = absoluteUrl('/');
  const image = media['hero.banner1'];
  const imageAlt = translatedKeys.includes('hero.banner1') ? image?.altText || 'GEDECO global trade' : 'GEDECO global trade';
  return { title, description, alternates: { canonical, languages: { vi, en: canonical, 'x-default': vi } }, robots: { index: page?.robotsIndex ?? true, follow: page?.robotsFollow ?? true }, openGraph: { type: 'website', locale: 'en_US', siteName: siteConfig.brand, url: canonical, title, description, images: image ? [{ url: absoluteUrl(image.url), alt: imageAlt }] : undefined } };
}

export default async function EnglishHome() {
  const [content, news] = await Promise.all([
    getPublicSiteContent('home', 'en'),
    getFeaturedNews('en'),
  ]);
  const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: siteConfig.brand, url: absoluteUrl('/en'), inLanguage: 'en' };
  return <><HomePage language="en" initialContent={content} initialNews={news} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, '\\u003c') }} /></>;
}
