'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { gedecoProducts, type GedecoProduct } from '../data/products';
import { Icon } from './inner-pages';

const pageSize = 4;

function chunkProducts(items: GedecoProduct[]) {
  return Array.from({ length: Math.ceil(items.length / pageSize) }, (_, page) => items.slice(page * pageSize, page * pageSize + pageSize));
}

export function ProductCarousel({ items = gedecoProducts, compact = false }: { items?: GedecoProduct[]; compact?: boolean }) {
  const pages = useMemo(() => chunkProducts(items), [items]);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => { setPage(0); }, [items]);
  useEffect(() => {
    if (compact || paused || pages.length < 2) return;
    const timer = window.setInterval(() => setPage((current) => (current + 1) % pages.length), 6000);
    return () => window.clearInterval(timer);
  }, [compact, pages.length, paused]);

  const pause = () => setPaused(true);
  const resume = () => { setPaused(false); setHoveredCard(null); };
  const goTo = (nextPage: number) => setPage((nextPage + pages.length) % pages.length);
  const renderCard = (product: GedecoProduct, cardIndex: number, key: string) => <article className={`product-card${hoveredCard === cardIndex ? ' is-hovered' : ''}`} key={key} onMouseEnter={() => setHoveredCard(cardIndex)} onFocus={() => setHoveredCard(cardIndex)}>
    <img src={product.image} alt={product.title} />
    <div className="product-card-body"><p className="product-category">{product.category.toUpperCase()}</p><h3>{product.title}</h3><p className="product-card-description">{product.description}</p><Link href="/lien-he" className="product-card-link">{compact ? 'Xem chi tiết' : 'Liên hệ về sản phẩm'} <Icon name="arrow" /></Link></div>
  </article>;

  if (compact) return <div className={`product-carousel product-carousel-compact${hoveredCard !== null ? ' has-hover' : ''}`} onMouseEnter={pause} onMouseLeave={resume}>
    <div className="product-carousel-viewport"><div className={`product-marquee-track${paused ? ' is-paused' : ''}`}><div className="product-marquee-set">{items.map((product, index) => renderCard(product, index, `marquee-a-${product.title}`))}</div><div className="product-marquee-set" aria-hidden="true">{items.map((product, index) => renderCard(product, index, `marquee-b-${product.title}`))}</div></div></div>
  </div>;

  return <div className={`product-carousel${hoveredCard !== null ? ' has-hover' : ''}`} onMouseEnter={pause} onMouseLeave={resume} onFocusCapture={pause} onBlurCapture={resume}>
    <div className="product-carousel-viewport"><div className="product-carousel-track" style={{ transform: `translateX(-${page * 100}%)` }}>{pages.map((productPage, pageIndex) => <div className="product-carousel-page" key={`product-page-${pageIndex}`}>{productPage.map((product, cardIndex) => renderCard(product, pageIndex * pageSize + cardIndex, `page-${pageIndex}-${product.title}`))}</div>)}</div></div>
    <div className="product-carousel-pagination" aria-label="Phân trang sản phẩm"><button type="button" aria-label="Trang sản phẩm trước" onClick={() => goTo(page - 1)}><Icon name="chevron" className="chevron-left" /></button>{pages.map((_, index) => <button type="button" key={index} className={page === index ? 'active' : ''} aria-label={`Trang sản phẩm ${index + 1}`} aria-current={page === index ? 'page' : undefined} onClick={() => goTo(index)}>{index + 1}</button>)}<button type="button" aria-label="Trang sản phẩm sau" onClick={() => goTo(page + 1)}><Icon name="chevron" /></button></div>
  </div>;
}
