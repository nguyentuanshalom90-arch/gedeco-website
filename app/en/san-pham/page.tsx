import Link from 'next/link';
import { EnglishPage } from '../../components/english-pages';
import { InnerHero, CTA, Icon } from '../../components/inner-pages';

const products = [['/assets/service-trade-derivative.png', 'Organic Matcha Powder', 'Domestic products'], ['/assets/service-sourcing-derivative.png', 'Arabica Coffee', 'Export products'], ['/assets/service-export-derivative.png', 'Robusta Coffee', 'Export products'], ['/assets/news-1-derivative.png', 'Canned Pineapple', 'Export products']];

export default function EnglishProducts() {
  return <EnglishPage active="Products"><InnerHero eyebrow="GEDECO PRODUCTS" title="Domestic and export products" subtitle="A selected introduction to products GEDECO connects with customers and partners." /><section className="product-categories"><div className="container"><div className="product-category-tabs"><Link href="/en/san-pham?category=domestic">DOMESTIC PRODUCTS</Link><Link href="/en/san-pham?category=export">EXPORT PRODUCTS</Link></div><div className="product-page-grid">{products.map(([image,title,category]) => <article key={title}><img src={image} alt={title} /><div><p className="eyebrow gold-text">{category}</p><h2>{title}</h2><p>Product information, origin and cooperation details will be updated by GEDECO through the content management area.</p><Link href="/en/lien-he" className="product-detail-link">Ask about this product <Icon name="arrow" /></Link></div></article>)}</div></div></section><CTA language="en" title="Which product are you interested in?" text="Tell GEDECO what you need and our team will suggest a suitable product and cooperation path." /></EnglishPage>;
}
