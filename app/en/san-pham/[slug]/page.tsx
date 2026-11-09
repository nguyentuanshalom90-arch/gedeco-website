import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CTA, InnerHero } from '../../../components/inner-pages';
import { EnglishPage } from '../../../components/english-pages';
import { gedecoProductDetails } from '../../../data/product-details';

export function generateStaticParams() { return gedecoProductDetails.map((product) => ({ slug: product.slug })); }

export default async function EnglishProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = gedecoProductDetails.find((item) => item.slug === slug);
  if (!product) notFound();
  return <EnglishPage active="Products"><InnerHero eyebrow={product.category.toUpperCase()} title={product.title} subtitle="Product information sourced from the GEDECO website." /><section className="product-detail-page"><div className="container"><nav className="product-breadcrumb" aria-label="Breadcrumb"><Link href="/en/san-pham">Products</Link><span>/</span><span>{product.title}</span></nav><div className="product-detail-grid"><div className="product-detail-media"><img src={product.image} alt={product.title} /></div><article className="product-detail-copy"><p className="eyebrow gold-text">{product.category.toUpperCase()}</p><h2>{product.title}</h2><div className="product-purchase-summary" dangerouslySetInnerHTML={{ __html: product.summaryHtml }} /><p className="product-price-line"><span>Price:</span> <strong>{product.priceText}</strong></p><p className="product-stock-line"><span>Status:</span> <strong>{product.stockText}</strong></p><img className="product-shipper" src={product.shipperImage} alt="Shipper delivery service" /><a className="button button-gold product-buy-button" href="tel:0914943653">Buy now</a><div className="product-guarantee"><h3>PURCHASE GUARANTEE</h3><ul><li>100% genuine, quality products</li><li>Best market pricing</li><li>Thoughtful after-sales service</li><li>For bulk orders, call <a href="tel:0946548996">0946548996</a> for the best price.</li></ul></div><Link className="product-detail-contact" href="/en/lien-he">Contact about this product</Link></article></div><article className="product-source-content" dangerouslySetInnerHTML={{ __html: product.contentHtml }} /><div className="product-detail-back"><Link href="/en/san-pham">← Back to products</Link></div></div></section><CTA language="en" title="Interested in this product?" text="Tell GEDECO what you need and our team will suggest a suitable cooperation path." /></EnglishPage>;
}
