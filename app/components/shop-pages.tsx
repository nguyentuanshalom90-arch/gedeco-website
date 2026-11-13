'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ContactActions } from './contact-actions';
import { EnglishFooter, EnglishHeader } from './english-pages';
import { Icon, InnerFooter, InnerHeader, InnerHero } from './inner-pages';
import type { GedecoProductDetail } from '../data/product-details';

type ShopProduct = Omit<GedecoProductDetail, 'category'> & { category: string };
import styles from './product-filters.module.css';

type ShopLanguage = 'vi' | 'en';

export function ShopHeader({ active = 'SẢN PHẨM', language = 'vi' }: { active?: string; language?: ShopLanguage }) {
  return language === 'en' ? <EnglishHeader active="Products" /> : <InnerHeader active={active === 'SẢN PHẨM' ? 'Sản phẩm' : active} />;
}

export function ShopHero({ title = 'Sản phẩm', language = 'vi' }: { title?: string; language?: ShopLanguage }) {
  const isProductsLanding = title === 'Sản phẩm' || title === 'Products';
  const english = language === 'en';
  return <InnerHero eyebrow="GEDECO PRODUCTS" title={isProductsLanding ? (english ? 'Domestic and export products' : 'Sản phẩm trong nước và xuất khẩu') : title} subtitle={isProductsLanding ? (english ? 'Explore GEDECO products, from Vietnamese sources to products connecting with international markets.' : 'Khám phá danh mục sản phẩm GEDECO, từ nguồn hàng Việt Nam đến các sản phẩm kết nối thị trường quốc tế.') : (english ? 'Product information and cooperation solutions from GEDECO.' : 'Thông tin sản phẩm và giải pháp hợp tác từ GEDECO.')} image="/assets/banner-1.jpg" />;
}

export function ShopBreadcrumb({ current, category, language = 'vi' }: { current: string; category?: string; language?: ShopLanguage }) {
  const english = language === 'en';
  const categoryIsExport = category === 'Sản phẩm xuất khẩu' || category === 'Export products';
  const categoryHref = english ? `/en/products?category=${categoryIsExport ? 'export' : 'domestic'}` : `/san-pham?category=${categoryIsExport ? 'xuat-khau' : 'trong-nuoc'}`;
  const homeHref = english ? '/en' : '/';
  const homeLabel = english ? 'Home' : 'Trang chủ';
  return <nav className="shop-breadcrumb" aria-label={english ? 'Breadcrumb' : 'Đường dẫn trang'}><Link href={homeHref}>{homeLabel}</Link><span>/</span>{category && <><Link href={categoryHref}>{category}</Link><span>/</span></>}<strong>{current}</strong></nav>;
}

export function ShopSidebar({ language = 'vi' }: { language?: ShopLanguage }) {
  const english = language === 'en';
  const news = english ? ['Lotus tea harvest season', 'Frequently asked questions about Matcha', 'Lotus-scented tea and its health benefits', '5 reasons to drink tea on cold days', 'Tea — a meaningful Tet gift'] : ['Mùa vụ Trà Ướp Sen','Một số câu hỏi thường gặp về Matcha','Trà ướp hoa Sen và công dụng diệu kì đối với sức khỏe','5 Lí do bạn nên uống trà vào ngày lạnh','TRÀ - QUÀ TẾT ĐẬM ĐÀ GẮN KẾT'];
  const dates = english ? ['May 29, 2024', 'August 7, 2023', 'July 3, 2023', 'July 5, 2022', 'July 26, 2021'] : ['29 tháng 5, 2024','7 tháng 8, 2023','3 tháng 7, 2023','5 tháng 7, 2022','26 tháng 7, 2021'];
  return <aside className="shop-sidebar"><section className="shop-support"><h2>{english ? 'CUSTOMER SUPPORT' : 'HỖ TRỢ KHÁCH HÀNG'}</h2><img src="/assets/shop-support.jpg" alt="GEDECO" /><strong>{english ? 'MY LINH' : 'MỸ LINH'}</strong><span>{english ? 'Phone: +(84) 914943653' : 'SĐT: +(84) 914943653'}</span></section><section className="shop-news"><h2>{english ? 'FEATURED NEWS' : 'TIN TỨC NỔI BẬT'}</h2>{news.map((item, index) => <Link href={english ? '/en/news' : '/tin-tuc'} key={item}><b>{item}</b><small>{dates[index]}</small></Link>)}</section></aside>;
}

export function ShopShell({ children, hero = true, current = 'Sản phẩm', language = 'vi' }: { children: React.ReactNode; hero?: boolean; current?: string; language?: ShopLanguage }) {
  useEffect(() => { document.documentElement.lang = language; return () => { document.documentElement.lang = 'vi'; }; }, [language]);
  return <div className={`shop-site${hero ? '' : ' shop-site-no-hero'}${language === 'en' ? ' shop-site-en' : ''}`}><ShopHeader language={language} />{hero && <ShopHero title={current} language={language} />}<main>{children}</main>{language === 'en' ? <EnglishFooter /> : <InnerFooter />}<ContactActions english={language === 'en'} /></div>;
}

type ProductCardItem = Pick<GedecoProductDetail, 'slug' | 'title' | 'image'> & { category: string };

export function localizeShopProductTitle(title: string, language: ShopLanguage = 'vi') {
  if (language === 'en') {
    const titleMap: Record<string, string> = {
      'Trà Đinh Thượng Hạng ướp Sen': 'Superior Dinh Tea Marinated with Lotus',
      'TIÊU ĐEN': 'BLACK PEPPER',
      'CÀ PHÊ ROBUSTA': 'ROBUSTA COFFEE',
      'CÀ PHÊ ARABICA': 'ARABICA COFFEE',
      'Rượu Đông Trùng Hạ Thảo': 'CORDYCEPS LIQUOR',
      'Đông Trùng Hạ Thảo Nguyên con': 'WHOLE CORDYCEPS',
      'BỘT MATCHA HỮU CƠ': 'ORGANIC MATCHA POWDER',
      'TRÀ ĐINH ƯỚP GẠO SEN': 'DING TEA WITH LOTUS RICE',
      'DIA SPITHERA XÓA SẠCH NẾP NHĂN': 'DIA SPITHERA WRINKLE CARE',
      'TRÀ ĐINH THƯỢNG HẠNG ƯỚP HOA BƯỞI': 'PREMIUM DING TEA WITH POMELO BLOSSOM',
      'TRÀ HOA VÀNG RỪNG TAM ĐẢO': 'WILD TAM DAO GOLDEN FLOWER TEA',
      'Trà ướp hoa sói': 'WOLF FLOWER SCENTED TEA',
      'TRÀ ĐINH THƯỢNG HẠNG NGUYÊN VỊ TRUYỀN THỐNG': 'PREMIUM DING TEA, TRADITIONAL FLAVOR',
      'TRÀ ĐINH THƯỢNG HẠNG ƯỚP HOA NHÀI': 'PREMIUM DING TEA WITH JASMINE',
      'HỘP TRÀ SEN THƯỢNG HẠNG 10': 'PREMIUM LOTUS TEA BOX 10',
      'DURIAN': 'DURIAN',
      'Canned pineapple': 'CANNED PINEAPPLE',
      'Fresh ginger, dried sliced ginger': 'FRESH GINGER, DRIED SLICED GINGER',
    };
    return titleMap[title] || title;
  }
  return title
    .replace(/Fresh ginger, dried sliced ginger/gi, 'Gừng tươi, gừng thái lát sấy khô')
    .replace(/Canned pineapple/gi, 'Dứa đóng hộp')
    .replace(/Durian/gi, 'Sầu riêng');
}

export function ShopProductCard({ product, className = '', language = 'vi', onMouseEnter, onFocus }: { product: ProductCardItem; className?: string; language?: ShopLanguage; onMouseEnter?: React.MouseEventHandler<HTMLElement>; onFocus?: React.FocusEventHandler<HTMLElement> }) {
  const english = language === 'en';
  const englishTitleBySlug: Record<string, string> = { 'tra-dinh-thuong-hang-uop-sen': 'SUPERIOR DINH TEA MARINATED WITH LOTUS', 'tieu-den': 'BLACK PEPPER', 'ca-phe-robusta': 'ROBUSTA COFFEE', 'ca-phe-arabica': 'ARABICA COFFEE', 'ruou-dong-trung-ha-thao': 'CORDYCEPS LIQUOR', 'dong-trung-ha-thao-nguyen-con': 'WHOLE CORDYCEPS', 'bot-matcha-huu-co': 'ORGANIC MATCHA POWDER', 'tra-dinh-uop-gao-sen': 'DING TEA WITH LOTUS RICE', 'dia-spithera-xoa-sach-nep-nhan': 'DIA SPITHERA WRINKLE CARE', 'tra-dinh-thuong-hang-uop-hoa-buoi': 'PREMIUM DINH TEA WITH POMELO BLOSSOM', 'tra-hoa-vang-rung': 'WILD TAM DAO GOLDEN FLOWER TEA', 'tra-uop-hoa-soi': 'WOLF FLOWER SCENTED TEA', 'nhat-pham-tra-nhai-tra-dinh-uop-hoa-nhai': 'PREMIUM DINH TEA, TRADITIONAL FLAVOR', 'tra-dinh-uop-hoa-nhai': 'PREMIUM DINH TEA WITH JASMINE', 'tra-dinh-uop-bong-sen': 'PREMIUM LOTUS TEA BOX 10', durian: 'DURIAN', 'thuc-pham-bao-ve-suc-khoe-carositol': "CAROSITOL — KOREA'S NO. 1 HEALTH SUPPLEMENT FOR DIABETES PREVENTION", 'canned-pineapple': 'CANNED PINEAPPLE', 'ca-tra-dau': 'FRESH GINGER, DRIED SLICED GINGER' };
  const title = english ? englishTitleBySlug[product.slug] || localizeShopProductTitle(product.title, language) : localizeShopProductTitle(product.title, language);
  const englishSlugMap: Record<string, string> = { 'tra-dinh-thuong-hang-uop-sen': 'premium-ding-tea-with-lotus', 'tieu-den': 'black-pepper', 'ca-phe-robusta': 'robusta-coffee', 'ca-phe-arabica': 'arabica-coffee', 'ruou-dong-trung-ha-thao': 'cordyceps-liquor', 'dong-trung-ha-thao-nguyen-con': 'whole-cordyceps', 'bot-matcha-huu-co': 'organic-matcha-powder', 'tra-dinh-uop-gao-sen': 'ding-tea-with-lotus-rice', 'dia-spithera-xoa-sach-nep-nhan': 'dia-spithera-wrinkle-care', 'tra-dinh-thuong-hang-uop-hoa-buoi': 'premium-ding-tea-with-pomelo-blossom', 'tra-hoa-vang-rung': 'wild-tam-dao-golden-flower-tea', 'tra-uop-hoa-soi': 'wolf-flower-scented-tea', 'nhat-pham-tra-nhai-tra-dinh-uop-hoa-nhai': 'premium-ding-tea-traditional-flavor', 'tra-dinh-uop-hoa-nhai': 'premium-ding-tea-with-jasmine', 'tra-dinh-uop-bong-sen': 'premium-lotus-tea-box-10', durian: 'durian', 'thuc-pham-bao-ve-suc-khoe-carositol': 'carositol-korean-health-supplement', 'canned-pineapple': 'canned-pineapple', 'ca-tra-dau': 'fresh-ginger-dried-sliced-ginger' };
  const href = english ? `/en/products/${englishSlugMap[product.slug] || product.slug}` : `/san-pham/${product.category === 'Sản phẩm xuất khẩu' ? 'xuat-khau' : 'trong-nuoc'}/${product.slug}`;
  return <article className={`shop-product-card ${className}`.trim()} onMouseEnter={onMouseEnter} onFocus={onFocus}><Link href={href} className="shop-product-image"><img src={product.image} alt={title} /></Link><div className="shop-product-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}><h3 style={{ height: '42.5px', minHeight: '42.5px', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}><Link href={href}>{title}</Link></h3><Link className="shop-product-cta" style={{ alignSelf: 'flex-start', marginTop: 'auto' }} href={href}>{english ? 'View details' : 'Xem chi tiết'} <Icon name="arrow" /></Link></div></article>;
}

export function ProductDetailGallery({ gallery, title, language = 'vi' }: { gallery: string[]; title: string; language?: ShopLanguage }) {
  const [selectedImage, setSelectedImage] = useState(gallery[0] || '');
  const english = language === 'en';
  return <div className="shop-detail-gallery"><div className="shop-detail-main-image"><img src={selectedImage} alt={title} /></div><div className="shop-detail-thumbs" role="list" aria-label={english ? 'Product image gallery' : 'Album ảnh sản phẩm'}>{gallery.map((image, index) => <button type="button" key={image} className={selectedImage === image ? 'active' : ''} onClick={() => setSelectedImage(image)} aria-label={`${english ? 'View image' : 'Xem ảnh'} ${index + 1}`}><img src={image} alt={`${title} ${index + 1}`} /></button>)}</div></div>;
}

export function ShopGuarantee({ language = 'vi' }: { language?: ShopLanguage }) {
  const english = language === 'en';
  return <div className="shop-guarantee"><h2>{english ? 'PURCHASE GUARANTEE' : 'CAM KẾT KHI MUA HÀNG'}</h2><ul><li><Icon name="check" /><span>{english ? '100% genuine, quality products' : 'Cam kết 100% hàng chính hãng chất lượng'}</span></li><li><Icon name="check" /><span>{english ? 'Best market pricing' : 'Giá cả tối ưu nhất thị trường'}</span></li><li><Icon name="check" /><span>{english ? 'Thoughtful after-sales service' : 'Dịch vụ hậu mãi chu đáo'}</span></li><li><Icon name="check" /><span>{english ? <>For bulk orders, call <a href="tel:0946548996">0946548996</a> for the best price.</> : <>Mua số lượng lớn. Vui lòng liên hệ <a href="tel:0946548996">0946548996</a> để được hỗ trợ giá tốt nhất.</>}</span></li></ul></div>;
}

export function ProductCatalog({ items, initialCategory, language = 'vi' }: { items: ShopProduct[]; initialCategory?: 'all' | 'domestic' | 'export'; language?: ShopLanguage }) {
  const english = language === 'en';
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

  const labels = english ? { all: 'All', domestic: 'Domestic', export: 'Export', sort: 'Sort by', default: 'Default', az: 'Name A–Z', za: 'Name Z–A', search: 'Search products...', clear: 'Reset', searching: 'Searching...', count: 'products', prev: 'Previous page', next: 'Next page', empty: 'No matching products found', emptyHint: 'Try another keyword or reset the filters.', showAll: 'View all products' } : { all: 'Tất cả', domestic: 'Trong nước', export: 'Xuất khẩu', sort: 'Sắp xếp', default: 'Mặc định', az: 'Tên A–Z', za: 'Tên Z–A', search: 'Tìm sản phẩm...', clear: 'Đặt lại', searching: 'Đang tìm...', count: 'sản phẩm', prev: 'Trang trước', next: 'Trang sau', empty: 'Không tìm thấy sản phẩm phù hợp', emptyHint: 'Thử từ khóa khác hoặc đặt lại bộ lọc.', showAll: 'Xem tất cả sản phẩm' };
  return <section className={styles.catalog} aria-label={english ? 'Product filters' : 'Bộ lọc sản phẩm'}>
    <div className={styles.filterRow}><div className={styles.chips} role="tablist" aria-label={english ? 'Product groups' : 'Nhóm sản phẩm'}><button type="button" className={category === 'all' ? styles.activeChip : ''} onClick={() => updateCategory('all')}>{labels.all} <b>{items.length}</b></button><button type="button" className={category === 'domestic' ? styles.activeChip : ''} onClick={() => updateCategory('domestic')}>{labels.domestic}</button><button type="button" className={category === 'export' ? styles.activeChip : ''} onClick={() => updateCategory('export')}>{labels.export}</button></div><div className={styles.viewAndCount}><div className={styles.sortWrap}><span>{labels.sort}</span><select value={sort} onChange={(event) => { setSort(event.target.value); setRemoteItems(null); }} aria-label={labels.sort}><option value="default">{labels.default}</option><option value="name">{labels.az}</option><option value="latest">{labels.za}</option></select></div><div className={styles.inlineSearchWrap}><Icon name="search" /><input value={query} onChange={(event) => { setQuery(event.target.value); setRemoteItems(null); }} placeholder={labels.search} aria-label={labels.search} />{query && <button type="button" onClick={() => { setQuery(''); setRemoteItems(null); }} aria-label={english ? 'Clear search' : 'Xóa tìm kiếm'}>×</button>}</div><span>{loading ? labels.searching : `${visibleItems.length} ${labels.count}`}</span>{(query || category !== 'all' || sort !== 'default') && <button type="button" className={styles.clear} onClick={clearFilters}>{labels.clear}</button>}</div></div>
    <div className="shop-products-grid">{pagedItems.map((product) => <ShopProductCard key={product.slug} product={product} language={language} />)}</div>
    {visibleItems.length > pageSize && <nav className={styles.pagination} aria-label={english ? 'Product pagination' : 'Phân trang sản phẩm'}>
      <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} aria-label={labels.prev}>←</button>
      {Array.from({ length: pageCount }, (_, index) => {
        const number = index + 1;
        return <button key={number} type="button" className={page === number ? styles.activePage : ''} aria-current={page === number ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>;
      })}
      <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} aria-label={labels.next}>→</button>
    </nav>}
    {!visibleItems.length && <div className={styles.empty}><strong>{labels.empty}</strong><span>{labels.emptyHint}</span><button type="button" onClick={clearFilters}>{labels.showAll}</button></div>}
  </section>;
}

export function ShopControls() {
  return <div className="shop-controls"><div className="shop-view-buttons"><button aria-label="Hai cột">▦</button><button className="active" aria-label="Ba cột">▦</button><button aria-label="Bốn cột">▦</button></div><select aria-label="Sắp xếp sản phẩm" defaultValue="default"><option value="default">Mặc định</option><option>Phổ biến nhất</option><option>Mới nhất</option><option>Giá thấp đến cao</option><option>Giá cao đến thấp</option></select></div>;
}

export function ShopRelated({ products, current, language = 'vi' }: { products: ShopProduct[]; current: string; language?: ShopLanguage }) {
  const english = language === 'en';
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
  return <section className="shop-related"><div className="shop-related-heading"><h2>{english ? 'RELATED PRODUCTS' : 'SẢN PHẨM LIÊN QUAN'}</h2><div className="shop-related-arrows"><button type="button" onClick={() => setIndex((currentIndex) => currentIndex <= 0 ? maxIndex : currentIndex - 1)} aria-label={english ? 'Previous products' : 'Sản phẩm trước'}>←</button><button type="button" onClick={() => setIndex((currentIndex) => currentIndex >= maxIndex ? 0 : currentIndex + 1)} aria-label={english ? 'Next products' : 'Sản phẩm tiếp theo'}>→</button></div></div><div className="shop-related-viewport"><div className="shop-related-track" style={{ transform: `translateX(calc(-1 * var(--related-step) * ${index}))` }}>{related.map((product) => <ShopProductCard key={product.slug} product={product} language={language} />)}</div></div></section>;
}
