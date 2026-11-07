import Link from 'next/link';
import { InnerHero, InnerPage, CTA } from '../components/inner-pages';
import { ProductCarousel } from '../components/product-carousel';

export default function ProductsPage() {
  return <InnerPage active="Sản phẩm"><InnerHero eyebrow="SẢN PHẨM GEDECO" title="Sản phẩm trong nước và xuất khẩu" subtitle="Danh mục sản phẩm tham khảo từ website GEDECO." /><section className="product-categories"><div className="container"><div className="product-category-tabs"><Link href="/san-pham?category=trong-nuoc">SẢN PHẨM TRONG NƯỚC</Link><Link href="/san-pham?category=xuat-khau">SẢN PHẨM XUẤT KHẨU</Link></div><ProductCarousel /></div></section><CTA title="Bạn quan tâm đến sản phẩm nào?" text="Gửi thông tin nhu cầu để GEDECO tư vấn sản phẩm và phương án hợp tác phù hợp." /></InnerPage>;
}
