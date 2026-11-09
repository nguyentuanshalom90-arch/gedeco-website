'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ContactActions } from './contact-actions';
import { Icon, InnerFooter, InnerHeader, InnerHero } from './inner-pages';
import type { GedecoProductDetail } from '../data/product-details';
import styles from './product-filters.module.css';

export function ShopHeader({ active = 'SẢN PHẨM' }: { active?: string }) {
  return <InnerHeader active={active === 'SẢN PHẨM' ? 'Sản phẩm' : active} />;
}

export function ShopHero({ title = 'Sản phẩm' }: { title?: string }) {
  const isProductsLanding = title === 'Sản phẩm';
  return <InnerHero eyebrow="GEDECO PRODUCTS" title={isProductsLanding ? 'Sản phẩm trong nước và xuất khẩu' : title} subtitle={isProductsLanding ? 'Khám phá danh mục sản phẩm GEDECO, từ nguồn hàng Việt Nam đến các sản phẩm kết nối thị trường quốc tế.' : 'Thông tin sản phẩm và giải pháp hợp tác từ GEDECO.'} image="/assets/banner-1.jpg" />;
}

export function ShopBreadcrumb({ current, category }: { current: string; category?: string }) {
  const categoryHref = category === 'Sản phẩm xuất khẩu' ? '/san-pham?category=xuat-khau' : '/san-pham?category=trong-nuoc';
  return <nav className="shop-breadcrumb" aria-label="Đường dẫn trang"><Link href="/">Trang chủ</Link><span>/</span>{category && <><Link href={categoryHref}>{category}</Link><span>/</span></>}<strong>{current}</strong></nav>;
}

export function ShopSidebar() {
  return <aside className="shop-sidebar"><section className="shop-support"><h2>HỖ TRỢ KHÁCH HÀNG</h2><img src="/assets/shop-support.jpg" alt="GEDECO" /><strong>MỸ LINH</strong><span>SĐT: +(84) 914943653</span></section><section className="shop-news"><h2>TIN TỨC NỔI BẬT</h2>{['Mùa vụ Trà Ướp Sen','Một số câu hỏi thường gặp về Matcha','Trà ướp hoa Sen và công dụng diệu kì đối với sức khỏe','5 Lí do bạn nên uống trà vào ngày lạnh','TRÀ - QUÀ TẾT ĐẬM ĐÀ GẮN KẾT'].map((item, index) => <Link href="/tin-tuc" key={item}><b>{item}</b><small>{['29 tháng 5, 2024','7 tháng 8, 2023','3 tháng 7, 2023','5 tháng 7, 2022','26 tháng 7, 2021'][index]}</small></Link>)}</section></aside>;
}

export function ShopShell({ children, hero = true, current = 'Sản phẩm' }: { children: React.ReactNode; hero?: boolean; current?: string }) {
  return <div className={`shop-site${hero ? '' : ' shop-site-no-hero'}`}><ShopHeader />{hero && <ShopHero title={current} />}<main>{children}</main><InnerFooter /><ContactActions /></div>;
}

type ProductCardItem = Pick<GedecoProductDetail, 'slug' | 'title' | 'category' | 'image'>;

export function localizeShopProductTitle(title: string) {
  return title
    .replace(/Fresh ginger, dried sliced ginger/gi, 'Gừng tươi, gừng thái lát sấy khô')
    .replace(/Canned pineapple/gi, 'Dứa đóng hộp')
    .replace(/Durian/gi, 'Sầu riêng');
}

export function ShopProductCard({ product, className = '', onMouseEnter, onFocus }: { product: ProductCardItem; className?: string; onMouseEnter?: React.MouseEventHandler<HTMLElement>; onFocus?: React.FocusEventHandler<HTMLElement> }) {
  const title = localizeShopProductTitle(product.title);
  const href = `/san-pham/${product.category === 'Sản phẩm xuất khẩu' ? 'xuat-khau' : 'trong-nuoc'}/${product.slug}`;
  return <article className={`shop-product-card ${className}`.trim()} onMouseEnter={onMouseEnter} onFocus={onFocus}><Link href={href} className="shop-product-image"><img src={product.image} alt={title} /></Link><div className="shop-product-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}><h3 style={{ height: '42.5px', minHeight: '42.5px', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}><Link href={href}>{title}</Link></h3><Link className="shop-product-cta" style={{ alignSelf: 'flex-start', marginTop: 'auto' }} href={href}>Xem chi tiết <Icon name="arrow" /></Link></div></article>;
}

export function ProductDetailGallery({ gallery, title }: { gallery: string[]; title: string }) {
  const [selectedImage, setSelectedImage] = useState(gallery[0] || '');
  return <div className="shop-detail-gallery"><div className="shop-detail-main-image"><img src={selectedImage} alt={title} /></div><div className="shop-detail-thumbs" role="list" aria-label="Album ảnh sản phẩm">{gallery.map((image, index) => <button type="button" key={image} className={selectedImage === image ? 'active' : ''} onClick={() => setSelectedImage(image)} aria-label={`Xem ảnh ${index + 1}`}><img src={image} alt={`${title} ${index + 1}`} /></button>)}</div></div>;
}

export function ShopGuarantee() {
  return <div className="shop-guarantee"><h2>CAM KẾT KHI MUA HÀNG</h2><ul><li><Icon name="check" /><span>Cam kết 100% hàng chính hãng chất lượng</span></li><li><Icon name="check" /><span>Giá cả tối ưu nhất thị trường</span></li><li><Icon name="check" /><span>Dịch vụ hậu mãi chu đáo</span></li><li><Icon name="check" /><span>Mua số lượng lớn. Vui lòng liên hệ <a href="tel:0946548996">0946548996</a> để được hỗ trợ giá tốt nhất.</span></li></ul></div>;
}

export function ProductCatalog({ items, initialCategory }: { items: GedecoProductDetail[]; initialCategory?: 'all' | 'domestic' | 'export' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const readCategory = (): 'all' | 'domestic' | 'export' => {
    if (typeof window === 'undefined') return 'all';
    const value = new URLSearchParams(window.location.search).get('category');
    return value === 'domestic' || value === 'trong-nuoc' ? 'domestic' : value === 'export' || value === 'xuat-khau' ? 'export' : 'all';
  };
  const [category, setCategory] = useState<'all' | 'domestic' | 'export'>(() => initialCategory || readCategory());
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [remoteItems, setRemoteItems] = useState<ProductCardItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRemoteItems(null);
    const timer = window.setTimeout(() => window.dispatchEvent(new CustomEvent('gedeco:product-category', { detail: { category: category === 'domestic' ? 'trong-nuoc' : category === 'export' ? 'xuat-khau' : '' } })), 0);
    return () => window.clearTimeout(timer);
  }, [category]);

  const updateCategory = (next: 'all' | 'domestic' | 'export') => {
    setCategory(next);
    setRemoteItems(null);
    const params = new URLSearchParams(window.location.search);
    if (next === 'all') params.delete('category');
    else params.set('category', next === 'domestic' ? 'trong-nuoc' : 'xuat-khau');
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  const localItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');
    const filtered = items.filter((item) => {
      const matchesCategory = category === 'all' || (category === 'domestic' ? item.category === 'Sản phẩm trong nước' : item.category === 'Sản phẩm xuất khẩu');
      const matchesQuery = !normalizedQuery || `${item.title} ${item.description}`.toLocaleLowerCase('vi-VN').includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
    return [...filtered].sort((a, b) => sort === 'latest' ? b.title.localeCompare(a.title, 'vi') : sort === 'name' ? a.title.localeCompare(b.title, 'vi') : 0);
  }, [category, items, query, sort]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ search: query, category, sort });
        const response = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
        if (response.ok) {
          const payload = await response.json() as { items?: ProductCardItem[] };
          setRemoteItems(payload.items || []);
        }
      } catch {
        if (!controller.signal.aborted) setRemoteItems(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 140);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [category, query, sort]);

  const visibleItems = remoteItems ?? localItems;
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const pagedItems = visibleItems.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [category, query, sort]);
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);
  const clearFilters = () => { setQuery(''); setSort('default'); updateCategory('all'); };

  return <section className={styles.catalog} aria-label="Bộ lọc sản phẩm">
    <div className={styles.filterRow}><div className={styles.chips} role="tablist" aria-label="Nhóm sản phẩm"><button type="button" className={category === 'all' ? styles.activeChip : ''} onClick={() => updateCategory('all')}>Tất cả <b>{items.length}</b></button><button type="button" className={category === 'domestic' ? styles.activeChip : ''} onClick={() => updateCategory('domestic')}>Trong nước</button><button type="button" className={category === 'export' ? styles.activeChip : ''} onClick={() => updateCategory('export')}>Xuất khẩu</button></div><div className={styles.viewAndCount}><div className={styles.sortWrap}><span>Sắp xếp</span><select value={sort} onChange={(event) => { setSort(event.target.value); setRemoteItems(null); }} aria-label="Sắp xếp sản phẩm"><option value="default">Mặc định</option><option value="name">Tên A–Z</option><option value="latest">Tên Z–A</option></select></div><div className={styles.inlineSearchWrap}><Icon name="search" /><input value={query} onChange={(event) => { setQuery(event.target.value); setRemoteItems(null); }} placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" />{query && <button type="button" onClick={() => { setQuery(''); setRemoteItems(null); }} aria-label="Xóa tìm kiếm">×</button>}</div><span>{loading ? 'Đang tìm...' : `${visibleItems.length} sản phẩm`}</span>{(query || category !== 'all' || sort !== 'default') && <button type="button" className={styles.clear} onClick={clearFilters}>Đặt lại</button>}</div></div>
    <div className="shop-products-grid">{pagedItems.map((product) => <ShopProductCard key={product.slug} product={product} />)}</div>
    {visibleItems.length > pageSize && <nav className={styles.pagination} aria-label="Phân trang sản phẩm">
      <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} aria-label="Trang trước">←</button>
      {Array.from({ length: pageCount }, (_, index) => {
        const number = index + 1;
        return <button key={number} type="button" className={page === number ? styles.activePage : ''} aria-current={page === number ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>;
      })}
      <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} aria-label="Trang sau">→</button>
    </nav>}
    {!visibleItems.length && <div className={styles.empty}><strong>Không tìm thấy sản phẩm phù hợp</strong><span>Thử từ khóa khác hoặc đặt lại bộ lọc.</span><button type="button" onClick={clearFilters}>Xem tất cả sản phẩm</button></div>}
  </section>;
}

export function ShopControls() {
  return <div className="shop-controls"><div className="shop-view-buttons"><button aria-label="Hai cột">▦</button><button className="active" aria-label="Ba cột">▦</button><button aria-label="Bốn cột">▦</button></div><select aria-label="Sắp xếp sản phẩm" defaultValue="default"><option value="default">Mặc định</option><option>Phổ biến nhất</option><option>Mới nhất</option><option>Giá thấp đến cao</option><option>Giá cao đến thấp</option></select></div>;
}

export function ShopRelated({ products, current }: { products: GedecoProductDetail[]; current: string }) {
  const related = products.filter((product) => product.slug !== current).slice(0, 8);
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  useEffect(() => {
    const syncVisibleCount = () => setVisibleCount(window.innerWidth <= 640 ? 2 : 4);
    syncVisibleCount();
    window.addEventListener('resize', syncVisibleCount);
    return () => window.removeEventListener('resize', syncVisibleCount);
  }, []);
  const maxIndex = Math.max(0, related.length - visibleCount);
  useEffect(() => { if (index > maxIndex) setIndex(0); }, [index, maxIndex]);
  useEffect(() => {
    if (related.length <= visibleCount) return;
    const timer = window.setInterval(() => setIndex((currentIndex) => currentIndex >= maxIndex ? 0 : currentIndex + 1), 4500);
    return () => window.clearInterval(timer);
  }, [maxIndex, related.length, visibleCount]);
  return <section className="shop-related"><div className="shop-related-heading"><h2>SẢN PHẨM LIÊN QUAN</h2><div className="shop-related-arrows"><button type="button" onClick={() => setIndex((currentIndex) => currentIndex <= 0 ? maxIndex : currentIndex - 1)} aria-label="Sản phẩm trước">←</button><button type="button" onClick={() => setIndex((currentIndex) => currentIndex >= maxIndex ? 0 : currentIndex + 1)} aria-label="Sản phẩm tiếp theo">→</button></div></div><div className="shop-related-viewport"><div className="shop-related-track" style={{ transform: `translateX(calc(-1 * var(--related-step) * ${index}))` }}>{related.map((product) => <ShopProductCard key={product.slug} product={product} />)}</div></div></section>;
}
