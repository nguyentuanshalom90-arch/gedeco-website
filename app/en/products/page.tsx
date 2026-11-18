import { listEnglishProducts } from '@/lib/products';
import type { Metadata } from 'next';
import { ProductCatalog, ShopBreadcrumb, ShopShell, ShopSidebar } from '../../components/shop-pages';
import { absoluteUrl, siteConfig } from '@/lib/site-config';
import { getPublicSiteContent } from '@/lib/site-content-public';

const sourceOrder = ['bot-matcha-huu-co', 'ca-phe-arabica', 'ca-phe-robusta', 'canned-pineapple', 'dia-spithera-xoa-sach-nep-nhan', 'dong-trung-ha-thao-nguyen-con', 'durian', 'ca-tra-dau', 'tra-dinh-uop-bong-sen', 'ruou-dong-trung-ha-thao', 'thuc-pham-bao-ve-suc-khoe-carositol', 'tieu-den'];

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent('san-pham', 'en');
  const canonical = absoluteUrl('/en/products');
  const hasEnglishContent = content.translatedKeys.length > 0;
  const title = hasEnglishContent && content.page?.metaTitle ? content.page.metaTitle : 'Products | GEDECO';
  const description = hasEnglishContent && content.page?.metaDescription ? content.page.metaDescription : 'Explore GEDECO domestic and export products.';
  return { title, description, alternates: { canonical, languages: { vi: absoluteUrl('/san-pham'), en: canonical, 'x-default': absoluteUrl('/san-pham') } }, robots: { index: content.page?.robotsIndex ?? true, follow: content.page?.robotsFollow ?? true }, openGraph: { type: 'website', locale: 'en_US', siteName: siteConfig.brand, url: canonical, title, description } };
}

export default async function EnglishProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; focus?: string }> }) {
  const [products, content] = await Promise.all([listEnglishProducts(), getPublicSiteContent('san-pham', 'en')]);
  const translated = new Set(content.translatedKeys);
  const text = (key: string, fallback: string) => translated.has(key) ? content.values[key] || fallback : fallback;
  const sorted = [...products].sort((a, b) => (sourceOrder.indexOf(a.sourceSlug) === -1 ? 99 : sourceOrder.indexOf(a.sourceSlug)) - (sourceOrder.indexOf(b.sourceSlug) === -1 ? 99 : sourceOrder.indexOf(b.sourceSlug)));
  const params = await searchParams;
  const hero = content.media['hero.image'];
  return <ShopShell language="en" current="Products" heroTitle={text('hero.title', 'Domestic and export products')} heroEyebrow={text('hero.eyebrow', 'GEDECO PRODUCTS')} heroSubtitle={text('hero.subtitle', 'Explore GEDECO products, from Vietnamese sources to products connecting with international markets.')} heroImage={hero?.url}><div className="shop-width shop-page-layout"><div className="shop-main"><ShopBreadcrumb language="en" current="Products" /><ProductCatalog items={sorted} initialCategory={params.category || 'all'} focusSearch={params.focus === 'search'} language="en" /></div><ShopSidebar language="en" /></div></ShopShell>;
}
