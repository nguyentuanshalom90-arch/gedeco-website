import Link from 'next/link';
import { EnglishPage } from '../../components/english-pages';
import { InnerHero, CTA, Icon } from '../../components/inner-pages';
import { gedecoProductDetails } from '../../data/product-details';

export default function EnglishProducts() {
  return <EnglishPage active="Products"><InnerHero eyebrow="GEDECO PRODUCTS" title="Domestic and export products" subtitle={`${gedecoProductDetails.length} products from the GEDECO source catalog.`} /><section className="product-categories"><div className="container"><div className="product-category-tabs"><Link href="/en/san-pham?category=domestic">DOMESTIC PRODUCTS</Link><Link href="/en/san-pham?category=export">EXPORT PRODUCTS</Link></div><div className="product-page-grid">{gedecoProductDetails.map((product) => <article key={product.slug}><img src={product.image} alt={product.title} /><div><p className="eyebrow gold-text">{product.category === 'Sản phẩm trong nước' ? 'DOMESTIC PRODUCTS' : 'EXPORT PRODUCTS'}</p><h2>{product.title}</h2><p>{product.description || 'Product information from the GEDECO source catalog.'}</p><Link href={`/en/san-pham/${product.slug}`} className="product-detail-link">View product details <Icon name="arrow" /></Link></div></article>)}</div></div></section><CTA language="en" title="Which product are you interested in?" text="Tell us what you need and our team will suggest a suitable product and cooperation path." /></EnglishPage>;
}
