import { listProducts } from '@/lib/products';
import { ProductCatalog, ShopBreadcrumb, ShopShell, ShopSidebar } from '../components/shop-pages';

const sourceOrder = ['bot-matcha-huu-co', 'ca-phe-arabica', 'ca-phe-robusta', 'canned-pineapple', 'dia-spithera-xoa-sach-nep-nhan', 'dong-trung-ha-thao-nguyen-con', 'durian', 'ca-tra-dau', 'tra-dinh-uop-bong-sen', 'ruou-dong-trung-ha-thao', 'thuc-pham-bao-ve-suc-khoe-carositol', 'tieu-den'];

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const products = [...await listProducts()].sort((a, b) => (sourceOrder.indexOf(a.slug) === -1 ? 99 : sourceOrder.indexOf(a.slug)) - (sourceOrder.indexOf(b.slug) === -1 ? 99 : sourceOrder.indexOf(b.slug)));
  const category = (await searchParams).category;
  const initialCategory = category === 'domestic' || category === 'trong-nuoc' ? 'domestic' : category === 'export' || category === 'xuat-khau' ? 'export' : 'all';
  return <ShopShell current="Sản phẩm"><div className="shop-width shop-page-layout"><div className="shop-main"><ShopBreadcrumb current="Sản phẩm" /><ProductCatalog items={products} initialCategory={initialCategory} /></div><ShopSidebar /></div></ShopShell>;
}
