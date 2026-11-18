import { listProducts } from '@/lib/products';
import { ProductCatalog, ShopBreadcrumb, ShopShell, ShopSidebar } from '../components/shop-pages';
import type { Metadata } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site-config';
import { getPublicSiteContent } from '@/lib/site-content-public';

const sourceOrder = ['bot-matcha-huu-co', 'ca-phe-arabica', 'ca-phe-robusta', 'canned-pineapple', 'dia-spithera-xoa-sach-nep-nhan', 'dong-trung-ha-thao-nguyen-con', 'durian', 'ca-tra-dau', 'tra-dinh-uop-bong-sen', 'ruou-dong-trung-ha-thao', 'thuc-pham-bao-ve-suc-khoe-carositol', 'tieu-den'];

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent('san-pham', 'vi');
  const canonical = absoluteUrl(content.page?.canonicalUrl || '/san-pham');
  const title = content.page?.metaTitle || 'Sản phẩm GEDECO';
  const description = content.page?.metaDescription || 'Khám phá sản phẩm trong nước và xuất khẩu của GEDECO.';
  return { title, description, alternates: { canonical, languages: { vi: canonical, en: absoluteUrl('/en/products'), 'x-default': canonical } }, robots: { index: content.page?.robotsIndex ?? true, follow: content.page?.robotsFollow ?? true }, openGraph: { type: 'website', locale: siteConfig.locale, siteName: siteConfig.brand, url: canonical, title, description } };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [products, content] = await Promise.all([listProducts(), getPublicSiteContent('san-pham', 'vi')]);
  const values = content.values;
  const category = (await searchParams).category;
  const initialCategory = category || 'all';
  const sorted = [...products].sort((a, b) => (sourceOrder.indexOf(a.slug) === -1 ? 99 : sourceOrder.indexOf(a.slug)) - (sourceOrder.indexOf(b.slug) === -1 ? 99 : sourceOrder.indexOf(b.slug)));
  const hero = content.media['hero.image'];
  return <ShopShell current="Sản phẩm" heroTitle={values['hero.title'] || 'Sản phẩm trong nước và xuất khẩu'} heroEyebrow={values['hero.eyebrow'] || 'GEDECO PRODUCTS'} heroSubtitle={values['hero.subtitle']} heroImage={hero?.url}><div className="shop-width shop-page-layout"><div className="shop-main"><ShopBreadcrumb current="Sản phẩm" /><ProductCatalog items={sorted} initialCategory={initialCategory} /></div><ShopSidebar /></div></ShopShell>;
}
