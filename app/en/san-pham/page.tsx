import { listEnglishProducts } from '@/lib/products';
import type { Metadata } from 'next';
import { ProductCatalog, ShopBreadcrumb, ShopShell, ShopSidebar } from '../../components/shop-pages';

const sourceOrder = ['bot-matcha-huu-co', 'ca-phe-arabica', 'ca-phe-robusta', 'canned-pineapple', 'dia-spithera-xoa-sach-nep-nhan', 'dong-trung-ha-thao-nguyen-con', 'durian', 'ca-tra-dau', 'tra-dinh-uop-bong-sen', 'ruou-dong-trung-ha-thao', 'thuc-pham-bao-ve-suc-khoe-carositol', 'tieu-den'];

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Products | GEDECO', description: 'Explore GEDECO domestic and export products.', alternates: { canonical: '/en/products', languages: { vi: '/san-pham', en: '/en/products' } } };

export default async function EnglishProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const products = [...await listEnglishProducts()].sort((a, b) => (sourceOrder.indexOf(a.sourceSlug) === -1 ? 99 : sourceOrder.indexOf(a.sourceSlug)) - (sourceOrder.indexOf(b.sourceSlug) === -1 ? 99 : sourceOrder.indexOf(b.sourceSlug)));
  const category = (await searchParams).category;
  const initialCategory = category === 'domestic' || category === 'trong-nuoc' ? 'domestic' : category === 'export' || category === 'xuat-khau' ? 'export' : 'all';
  return <ShopShell language="en" current="Products"><div className="shop-width shop-page-layout"><div className="shop-main"><ShopBreadcrumb language="en" current="Products" /><ProductCatalog items={products} initialCategory={initialCategory} language="en" /></div><ShopSidebar language="en" /></div></ShopShell>;
}
