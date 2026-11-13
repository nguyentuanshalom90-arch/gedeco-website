import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getEnglishProductBySlug, listEnglishProducts } from '@/lib/products';
import { Icon } from '../../../components/inner-pages';
import { ProductDetailGallery, ShopBreadcrumb, ShopGuarantee, ShopRelated, ShopShell, ShopSidebar } from '../../../components/shop-pages';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await getEnglishProductBySlug(slug);
  if (!resolved) return { title: 'Product not found | GEDECO' };
  const canonical = `/en/products/${resolved.canonicalSlug}`;
  return {
    title: `${resolved.view.title} | GEDECO`,
    description: resolved.view.description.slice(0, 160),
    alternates: { canonical, languages: { vi: `/san-pham/${resolved.sourceSlug}`, en: canonical } },
    openGraph: { title: resolved.view.title, description: resolved.view.description.slice(0, 160), url: canonical, images: resolved.view.image ? [resolved.view.image] : undefined },
  };
}

export default async function EnglishProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = await getEnglishProductBySlug(slug);
  if (!resolved) notFound();
  if (resolved.canonicalSlug !== slug) redirect(`/en/products/${resolved.canonicalSlug}`);
  const product = resolved.view;
  const gallery = [product.image, ...product.gallery.filter((item) => item !== product.image)].slice(0, 6);
  const all = await listEnglishProducts();
  return <ShopShell language="en" hero={false}><div className="shop-width shop-detail-layout"><div className="shop-main"><ShopBreadcrumb language="en" current={product.title} category={product.category} /><section className="shop-product-detail"><ProductDetailGallery gallery={gallery} title={product.title} language="en" /><article className="shop-detail-summary"><h1>{product.title}</h1>{product.summaryHtml && <div className="shop-summary-html" dangerouslySetInnerHTML={{ __html: product.summaryHtml }} />}{product.stockText && !/Status:/i.test(product.summaryHtml) && <p className="shop-stock">Status: <strong>{product.stockText}</strong></p>}<img className="shop-shipper" src={product.shipperImage} alt="Delivery service" /><a className="shop-buy" href="tel:+84914943653"><Icon name="phone" />BUY NOW</a><ShopGuarantee language="en" /></article></section><section className="shop-description"><div className="shop-description-tab">PRODUCT DESCRIPTION</div><article dangerouslySetInnerHTML={{ __html: product.contentHtml }} /><a className="shop-product-contact" href="tel:+84914943653"><Icon name="phone" />Contact about this product · 0914 94 3653</a></section><ShopRelated products={all} current={product.slug} language="en" /></div><ShopSidebar language="en" /></div></ShopShell>;
}
