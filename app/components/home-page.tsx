'use client';

import { useEffect, useState } from 'react';
import { ContactActions } from './contact-actions';
import { LanguageSwitcher } from './language-switcher';
import { ProductCarousel } from './product-carousel';
import { InnerFooter } from './inner-pages';
import type { FeaturedNewsItem } from '@/lib/featured-news';

type IconName = 'globe' | 'handshake' | 'chart' | 'people' | 'box' | 'ship' | 'truck' | 'building' | 'globeAlt' | 'handshakeAlt' | 'team' | 'search' | 'phone' | 'mail' | 'pin' | 'arrow' | 'chevron' | 'facebook' | 'music' | 'youtube' | 'linkedin';

type ChromeValue = { value: string; url: string; imageUrl: string; altText: string; caption: string };
export type ContentMedia = { url: string; altText: string; caption: string };
export type HomeInitialContent = { values: Record<string, string>; staticValues: Record<string, string>; media: Record<string, ContentMedia>; translatedKeys: string[] };
type HomeCategory = { id: string; name: string; slug: string; nameEn: string; slugEn: string };

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const common = { className: `icon-svg ${className}`, viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  const paths: Record<IconName, React.ReactNode> = {
    globe: <><circle cx="24" cy="24" r="17" /><path d="M7 24h34M24 7c5 5 7 10 7 17s-2 12-7 17c-5-5-7-10-7-17s2-12 7-17ZM12 13c3 2 7 3 12 3s9-1 12-3M12 35c3-2 7-3 12-3s9 1 12 3" /></>,
    handshake: <><path d="m7 20 7-6 9 4 4-3 14 8-5 8-9-5-6 5-8-5-6 3-5-9 5-3Z" /><path d="m16 26 5 3 5-4 7 4M23 18l7 8" /></>,
    chart: <><path d="M8 39h32M12 35V25h7v10M22 35V18h7v17M32 35V10h7v25M10 19l10-7 8 3 10-8" /><path d="m32 8 6-1-2 6" /></>,
    people: <><circle cx="24" cy="16" r="5" /><circle cx="11" cy="19" r="4" /><circle cx="37" cy="19" r="4" /><path d="M14 38c0-7 4-11 10-11s10 4 10 11M5 37c0-5 2-8 6-8 2 0 4 1 5 3M43 37c0-5-2-8-6-8-2 0-4 1-5 3" /></>,
    box: <><path d="m24 7 15 8-15 8-15-8 15-8Z" /><path d="M9 15v17l15 9 15-9V15M24 23v18M16 11l15 8" /></>,
    ship: <><path d="M7 31h34l-5 7H12l-5-7ZM12 31V18h24v13M16 18V11h8v7M28 18v-5h5v5M5 42c4-3 7 3 11 0 4-3 7 3 11 0 4-3 7 3 11 0" /></>,
    truck: <><path d="M5 12h25v23H5zM30 22h7l6 6v7H30zM12 35a4 4 0 1 0 8 0M34 35a4 4 0 1 0 8 0" /></>,
    building: <><path d="M10 40V12l14-5v33M24 40h14V18l-14-4M15 17h4M15 24h4M15 31h4M29 23h4M29 30h4M29 37h4M7 40h34" /></>,
    globeAlt: <><circle cx="24" cy="24" r="17" /><path d="M8 26c7-3 12-1 16 3 4 4 9 5 16 1M12 12c6 2 10 6 12 12 2 6 6 10 12 12M24 7c-2 6-2 12 0 17 2 5 2 11 0 17" /></>,
    handshakeAlt: <><path d="M8 22 16 14l8 3 5-4 11 9-6 7-8-5-6 5-7-4-5 3-5-6 5-3Z" /><path d="m16 29 5 3 6-5M24 17l7 8" /></>,
    team: <><circle cx="24" cy="15" r="4" /><circle cx="12" cy="19" r="3" /><circle cx="36" cy="19" r="3" /><path d="M16 39c0-7 3-11 8-11s8 4 8 11M5 37c0-5 2-8 6-8 2 0 4 1 5 3M43 37c0-5-2-8-6-8-2 0-4 1-5 3" /></>,
    search: <><circle cx="21" cy="21" r="9" /><path d="m28 28 8 8" /></>,
    phone: <path d="M14 8 8 12c1 13 10 22 23 28l5-6-8-6-4 3c-4-2-7-5-9-9l3-4-4-10Z" />,
    mail: <><rect x="7" y="11" width="34" height="26" rx="2" /><path d="m8 14 16 12 16-12" /></>,
    pin: <><path d="M24 41s12-12 12-22a12 12 0 1 0-24 0c0 10 12 22 12 22Z" /><circle cx="24" cy="19" r="4" /></>,
    arrow: <><path d="M7 24h31" /><path d="m28 14 10 10-10 10" /></>,
    chevron: <path d="m18 12 12 12-12 12" />,
    facebook: <path d="M27 10h-4c-3 0-5 2-5 5v4h-4v6h4v13h7V25h5l1-6h-6v-3c0-1 1-2 2-2h4v-4Z" />,
    music: <path d="M29 9v22a6 6 0 1 1-5-6V14l16-4v18a6 6 0 1 1-5-6V7l-6 2Z" />,
    youtube: <><rect x="7" y="12" width="34" height="24" rx="6" /><path d="m21 19 10 5-10 5v-10Z" /></>,
    linkedin: <><rect x="9" y="9" width="30" height="30" rx="2" /><path d="M15 20v12M15 15v1M22 32V20M22 25c0-4 8-5 8 1v6" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const defaultHeroBanners = ['/assets/banner-1.optimized.webp', '/assets/banner-2.optimized.webp'];
type HomeLanguage = 'vi' | 'en';

const homeCopy = {
  vi: {
    ariaHome: 'GEDECO trang chủ', menu: 'Mở menu', search: 'Tìm kiếm', home: 'Trang chủ', about: 'Giới thiệu', news: 'Tin tức', products: 'Sản phẩm', contact: 'Liên hệ', domestic: 'Sản phẩm trong nước', export: 'Sản phẩm xuất khẩu', cta: 'Liên hệ ngay', heroEyebrow: 'GEDECO', heroTitle: 'Kết nối nguồn lực\nMở rộng giá trị', heroCopy: 'GEDECO phát triển nguồn hàng Việt Nam và kết nối sản phẩm chất lượng với khách hàng, đối tác trong nước và quốc tế.', explore: 'Khám phá sản phẩm', consult: 'Liên hệ tư vấn', highlights: [['Mở rộng thị trường','Kết nối doanh nghiệp toàn cầu'],['Đối tác tin cậy','Đồng hành phát triển bền vững'],['Giải pháp toàn diện','Từ nguồn hàng đến giao nhận'],['Đồng hành bền vững','Cùng phát triển lâu dài']], aboutTitle: 'CÔNG TY CỔ PHẦN GEDECO', aboutBody: ['Gedeco là một trong những Công ty kinh tế tư nhân đa ngành. Gedeco hoạt động trong 3 lĩnh vực kinh doanh cốt lõi, bao gồm: Nông nghiệp, Công nghiệp, Thương mại Dịch vụ.','Với mong muốn đem đến cho thị trường những sản phẩm – dịch vụ theo tiêu chuẩn quốc tế và những trải nghiệm hoàn toàn mới về phong cách sống hiện đại, ở bất cứ lĩnh vực nào Gedeco cũng chứng tỏ vai trò tiên phong, dẫn dắt sự thay đổi xu hướng tiêu dùng.'], learn: 'Tìm hiểu thêm về GEDECO', projectsTitle: 'Dự án tiêu biểu', projectsAll: 'Xem tất cả dự án →', projectMore: 'Xem chi tiết', productsTitle: 'Sản phẩm nổi bật', productsAll: 'Xem tất cả sản phẩm →', newsTitle: 'Tin tức nổi bật', newsPaused: 'Đang tạm dừng', newsAuto: 'Tự động chuyển tin', prev: 'Tin trước', next: 'Tin sau', read: 'Đọc thêm' },
  en: {
    ariaHome: 'GEDECO home', menu: 'Open menu', search: 'Search', home: 'Home', about: 'About', news: 'News', products: 'Products', contact: 'Contact', domestic: 'Domestic products', export: 'Export products', cta: 'Contact us', heroEyebrow: 'GEDECO', heroTitle: 'Connecting resources\nCreating value', heroCopy: 'GEDECO develops Vietnamese sources and connects quality products with customers and partners in Vietnam and worldwide.', explore: 'Explore products', consult: 'Contact us', highlights: [['Expanding markets','Connecting businesses worldwide'],['Trusted partner','Growing together sustainably'],['Complete solutions','From source to delivery'],['Long-term support','Building lasting relationships']], aboutTitle: 'GEDECO CORPORATION', aboutBody: ['GEDECO is a multi-sector private enterprise operating across agriculture, industry and trade services.','We bring internationally aligned products and services to the market while creating modern, practical and sustainable value for customers and partners.'], learn: 'Learn more about GEDECO', projectsTitle: 'Featured projects', projectsAll: 'View all projects →', projectMore: 'View project', productsTitle: 'Featured products', productsAll: 'View all products →', newsTitle: 'Featured news', newsPaused: 'Paused', newsAuto: 'Auto-playing news', prev: 'Previous news', next: 'Next news', read: 'Read more' },
} as const;

export default function HomePage({ language = 'vi', initialContent, initialNews = [] }: { language?: HomeLanguage; initialContent?: HomeInitialContent; initialNews?: FeaturedNewsItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [newsSlide, setNewsSlide] = useState(0);
  const [newsPaused, setNewsPaused] = useState(false);
  const [content, setContent] = useState<Record<string, string>>(() => ({ ...(initialContent?.values || {}), ...Object.fromEntries(Object.entries(initialContent?.staticValues || {}).map(([key, value]) => [`static.${key}`, value])) }));
  const [contentMedia, setContentMedia] = useState<Record<string, ContentMedia>>(initialContent?.media || {});
  const [translatedKeys, setTranslatedKeys] = useState<string[]>(initialContent?.translatedKeys || []);
  const [featuredNews, setFeaturedNews] = useState<FeaturedNewsItem[]>(initialNews);
  const [productCategories, setProductCategories] = useState<HomeCategory[]>([]);
  const [chrome, setChrome] = useState<Record<string, ChromeValue>>({});
  const copy = homeCopy[language];
  useEffect(() => {
    const sections = [...document.querySelectorAll('main section[id]')];
    const links = [...document.querySelectorAll('.main-nav a')];
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }), { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setHeroSlide((current) => (current + 1) % defaultHeroBanners.length), 6000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!featuredNews.length) return;
    if (newsPaused) return;
    const timer = window.setInterval(() => setNewsSlide((current) => current + 1), 5000);
    return () => window.clearInterval(timer);
  }, [featuredNews.length, newsPaused]);
  useEffect(() => {
    if (!featuredNews.length || newsSlide !== featuredNews.length) return;
    const timer = window.setTimeout(() => setNewsSlide(0), 760);
    return () => window.clearTimeout(timer);
  }, [featuredNews.length, newsSlide]);
  useEffect(() => {
    fetch(`/api/site-content?page=home&lang=${language}`).then((response) => response.ok ? response.json() : null).then((payload) => {
      if (payload?.values) {
        setContent({ ...payload.values, ...Object.fromEntries(Object.entries(payload.staticValues || {}).map(([key, value]) => [`static.${key}`, value as string])) });
        setContentMedia(payload.media || {});
        setTranslatedKeys(payload.translatedKeys || []);
      }
    }).catch(() => undefined);
  }, [language]);
  useEffect(() => {
    fetch(`/api/featured-news?lang=${language}`).then((response) => response.ok ? response.json() : null).then((payload) => { setFeaturedNews(Array.isArray(payload?.items) ? payload.items : []); setNewsSlide(0); }).catch(() => setFeaturedNews([]));
  }, [language]);
  useEffect(() => {
    fetch('/api/product-categories').then((response) => response.ok ? response.json() : null).then((payload) => setProductCategories(Array.isArray(payload?.items) ? payload.items : [])).catch(() => setProductCategories([]));
  }, []);
  useEffect(() => {
    Promise.all([
      fetch(`/api/site-chrome?area=HEADER&lang=${language}`).then((response) => response.ok ? response.json() : null),
      fetch(`/api/site-chrome?area=FOOTER&lang=${language}`).then((response) => response.ok ? response.json() : null),
    ]).then(([header, footer]) => setChrome({ ...(header?.values || {}), ...(footer?.values || {}) })).catch(() => undefined);
  }, [language]);

  const closeMenu = () => setMenuOpen(false);
  const chromeGet = (key: string, fallback: string) => chrome[key]?.value || fallback;
  const chromeUrl = (key: string, fallback: string) => chrome[key]?.url || fallback;
  const contentGet = (key: string, fallback: string) => language === 'en' ? (translatedKeys.includes(key) ? content[key] || fallback : fallback) : content[key] || fallback;
  const mediaGet = (key: string, fallbackUrl: string, fallbackAlt: string) => {
    const item = contentMedia[key];
    const translated = language !== 'en' || translatedKeys.includes(key);
    return { url: item?.url || fallbackUrl, altText: translated ? item?.altText || fallbackAlt : fallbackAlt, caption: translated ? item?.caption || '' : '' };
  };
  const heroTitle = contentGet('hero.title', copy.heroTitle);
  const [heroLead, heroAccent = ''] = heroTitle.split(/\r?\n/);
  const heroMedia = [mediaGet('hero.banner1', content['hero.banner1'] || defaultHeroBanners[0], language === 'en' ? 'GEDECO global trade' : 'Hoạt động thương mại toàn cầu của GEDECO'), mediaGet('hero.banner2', content['hero.banner2'] || defaultHeroBanners[1], language === 'en' ? 'GEDECO products and markets' : 'Sản phẩm và thị trường của GEDECO')];
  const heroBanners = heroMedia.map((item) => item.url);
  const highlights = [1, 2, 3, 4].map((index) => [contentGet(`highlights.${index}.title`, copy.highlights[index - 1][0]), contentGet(`highlights.${index}.body`, copy.highlights[index - 1][1])] as const);
  const projectFallbacks = language === 'en' ? [['/assets/service-export.optimized.webp', 'Agricultural source development', 'Building reliable Vietnamese agricultural sources.'], ['/assets/service-sourcing.optimized.webp', 'Tea product cooperation', 'Connecting tea regions, processors and distribution partners.'], ['/assets/news-1.optimized.webp', 'Export market connection', 'Supporting businesses as they prepare for new markets.']] : [['/assets/service-export.optimized.webp', 'Phát triển nguồn hàng nông sản', 'Xây dựng nguồn hàng Việt Nam có chất lượng và giá trị bền vững.'], ['/assets/service-sourcing.optimized.webp', 'Hợp tác sản phẩm trà', 'Kết nối vùng nguyên liệu, đơn vị chế biến và đối tác phân phối.'], ['/assets/news-1.optimized.webp', 'Kết nối xuất khẩu', 'Đồng hành cùng doanh nghiệp trong chuẩn bị và mở rộng thị trường.']];
  const featuredProjects = projectFallbacks.map(([image, title, projectCopy], index) => ({ media: mediaGet(`projects.${index + 1}.image`, content[`projects.${index + 1}.image`] || image, title), title: contentGet(`projects.${index + 1}.title`, title), copy: contentGet(`projects.${index + 1}.copy`, projectCopy) }));
  const carouselNews = [...featuredNews, ...featuredNews];
  const categoryLinks = productCategories.length ? productCategories.map((category) => ({ id: category.id, label: language === 'en' ? category.nameEn : category.name, slug: language === 'en' ? category.slugEn : category.slug })) : [{ id: 'domestic', label: copy.domestic, slug: language === 'en' ? 'domestic' : 'trong-nuoc' }, { id: 'export', label: copy.export, slug: language === 'en' ? 'export' : 'xuat-khau' }];
  return <>
    <header className="site-header" id="top"><div className="nav-shell">
      <a className="brand" href="#top" aria-label={copy.ariaHome}><img src="/assets/logo-lockup.optimized.webp" alt="GEDECO" />{chrome['brand.logo']?.caption ? <span className="sr-only">{chrome['brand.logo'].caption}</span> : null}</a>
      <button className="menu-toggle" aria-label={copy.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      <nav className={`main-nav${menuOpen ? ' open' : ''}`} aria-label={language === 'en' ? 'Main navigation' : 'Điều hướng chính'}>
        <a className="active" href="#top" onClick={closeMenu}>{chromeGet('navigation.home', copy.home)}</a>
        <a href={language === 'en' ? '/en/about' : '/gioi-thieu'} onClick={closeMenu}>{chromeGet('navigation.about', copy.about)}</a>
        <a href={language === 'en' ? '/en/news' : '/tin-tuc'} onClick={closeMenu}>{chromeGet('navigation.news', copy.news)}</a>
        <div className="nav-dropdown"><a href={language === 'en' ? '/en/products' : '/san-pham'} onClick={closeMenu}>{chromeGet('navigation.products', copy.products)} <span className="nav-chevron" aria-hidden="true"><Icon name="chevron" /></span></a><div className="nav-submenu">{categoryLinks.map((category) => <a key={category.id} href={`${language === 'en' ? '/en/products' : '/san-pham'}?category=${category.slug}`} onClick={closeMenu}>{category.label}</a>)}</div></div>
        <a href={language === 'en' ? '/en/contact' : '/lien-he'} onClick={closeMenu}>{chromeGet('navigation.contact', copy.contact)}</a>
      </nav>
      <div className="nav-tools"><button className="search-btn" aria-label={copy.search} onClick={() => { window.location.href = language === 'en' ? '/en/products?focus=search' : '/san-pham?focus=search'; }}><Icon name="search" /></button><LanguageSwitcher english={language === 'en'} /><a className="button button-gold button-small" href={chromeUrl('cta.label', language === 'en' ? '/en/contact' : '#contact')}>{chromeGet('cta.label', copy.cta)} <Icon name="arrow" /></a></div>
    </div></header>

    <main id="main-content">
      <section className="hero section-dark" style={{ backgroundImage: `url('${heroBanners[heroSlide]}')` }}><span className="sr-only" role="img" aria-label={heroMedia[heroSlide]?.altText} /><div className="hero-overlay" /><div className="hero-slide-controls" aria-label={contentGet('hero.controlsLabel', copy.newsTitle)}><button type="button" aria-label={copy.prev} onClick={() => setHeroSlide((current) => (current - 1 + heroBanners.length) % heroBanners.length)}>‹</button><button type="button" aria-label={copy.next} onClick={() => setHeroSlide((current) => (current + 1) % heroBanners.length)}>›</button></div><div className="hero-slide-dots" aria-label={contentGet('hero.controlsLabel', copy.newsTitle)}>{heroBanners.map((banner, index) => <button key={`${banner}-${index}`} type="button" className={heroSlide === index ? 'active' : ''} aria-label={`${contentGet('hero.bannerLabel', language === 'en' ? 'Banner' : 'Ảnh banner')} ${index + 1}`} aria-pressed={heroSlide === index} onClick={() => setHeroSlide(index)} />)}</div><div className="container hero-content"><p className="eyebrow">{contentGet('hero.eyebrow', copy.heroEyebrow)}</p><h1>{heroLead}<br /><em>{heroAccent}</em></h1><p className="hero-copy">{contentGet('hero.copy', copy.heroCopy)}</p><div className="hero-actions"><a className="button button-gold" href={language === 'en' ? '/en/products' : '/san-pham'}>{contentGet('hero.exploreLabel', copy.explore)} <Icon name="arrow" /></a><a className="button button-outline" href={language === 'en' ? '/en/contact' : '/lien-he'}>{contentGet('hero.consultLabel', copy.consult)}</a></div><div className="hero-highlights">{highlights.map(([title, description], index) => <div key={`${title}-${index}`}><span className="highlight-icon"><Icon name={(['globe','handshake','chart','people'] as const)[index]} /></span><div><strong>{title}</strong><small>{description}</small></div></div>)}</div></div></section>
      <section className="about" id="about"><div className="container about-grid"><div className="about-image">{(() => { const image = mediaGet('about.image', '/assets/banner-2.optimized.webp', contentGet('about.title', copy.aboutTitle)); return <figure><img src={image.url} alt={image.altText} />{image.caption ? <figcaption>{image.caption}</figcaption> : null}</figure>; })()}</div><div className="about-copy"><h2>{contentGet('about.title', copy.aboutTitle)}</h2><p>{contentGet('about.copy', copy.aboutBody[0])}</p><p>{contentGet('about.copy2', copy.aboutBody[1])}</p><a className="button button-gold" href={language === 'en' ? '/en/about' : '/gioi-thieu'}>{contentGet('about.buttonLabel', copy.learn)} <Icon name="arrow" /></a></div></div></section>
      <section className="home-projects"><div className="container"><div className="partner-head"><div><h2>{contentGet('projects.title', copy.projectsTitle)}</h2></div></div><div className="home-project-grid">{featuredProjects.map(({ media, title, copy: projectCopy }, index)=><article key={`${title}-${index}`}><figure><img src={media.url} alt={media.altText}/>{media.caption ? <figcaption>{media.caption}</figcaption> : null}</figure><div><h3>{title}</h3><p>{projectCopy}</p></div></article>)}</div></div></section>
      <section className="home-products" id="products"><div className="container"><div className="partner-head"><div><h2>{contentGet('products.title', copy.productsTitle)}</h2></div><a href={language === 'en' ? '/en/products' : '/san-pham'}>{contentGet('products.allLabel', copy.productsAll)}</a></div><ProductCarousel compact language={language} /></div></section>
      {featuredNews.length > 0 && <section className="news section-dark" id="news"><div className="container news-grid" aria-live="polite" onMouseEnter={() => setNewsPaused(true)} onMouseLeave={() => setNewsPaused(false)} onFocusCapture={() => setNewsPaused(true)} onBlurCapture={() => setNewsPaused(false)}><div className="news-intro"><h2>{contentGet('news.title', copy.newsTitle)}</h2><p className="news-auto-status">{newsPaused ? contentGet('news.pausedLabel', copy.newsPaused) : contentGet('news.autoLabel', copy.newsAuto)}</p></div><div className="news-carousel"><div className="news-cards-track" style={{ transform: `translateX(calc(-${newsSlide * 33.333333}% - ${newsSlide * 4.666667}px))` }}>{carouselNews.map((item, index) => <article className="news-card" key={`${item.id}-${index}`}><figure><img src={item.imageUrl} alt={item.imageAlt || item.title} />{item.imageCaption ? <figcaption>{item.imageCaption}</figcaption> : null}</figure><small>{item.category.toLocaleUpperCase(language === 'en' ? 'en' : 'vi')}<span>{item.date}</span></small><h3>{item.title}</h3><a href={item.href}>{contentGet('news.readLabel', copy.read)} <Icon name="arrow" /></a></article>)}</div><div className="news-controls" aria-label={contentGet('news.title', copy.newsTitle)}><button type="button" aria-label={copy.prev} onClick={() => setNewsSlide((current) => current === 0 ? featuredNews.length - 1 : current - 1)}><Icon name="chevron" className="chevron-left" /></button><button type="button" aria-label={copy.next} onClick={() => setNewsSlide((current) => current + 1)}><Icon name="chevron" /></button></div></div></div></section>}
    </main>

    <InnerFooter language={language} /><ContactActions english={language === 'en'} />
  </>;
}
