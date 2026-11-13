'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ContactActions } from './components/contact-actions';
import { LanguageSwitcher } from './components/language-switcher';
import { ProductCarousel } from './components/product-carousel';
import { InnerFooter } from './components/inner-pages';

type IconName = 'globe' | 'handshake' | 'chart' | 'people' | 'box' | 'ship' | 'truck' | 'building' | 'globeAlt' | 'handshakeAlt' | 'team' | 'search' | 'phone' | 'mail' | 'pin' | 'arrow' | 'chevron' | 'facebook' | 'music' | 'youtube' | 'linkedin';

type ChromeValue = { value: string; url: string; imageUrl: string; altText: string };

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

const services = [
  ['globe', 'Xuất khẩu & sourcing', 'Phát triển nguồn hàng Việt Nam và kết nối với khách hàng quốc tế phù hợp.', 'service-trade-derivative.png'],
  ['box', 'Thương mại & phân phối', 'Tìm kiếm, đánh giá và đưa sản phẩm chất lượng đến đúng thị trường.', 'service-sourcing-derivative.png'],
  ['ship', 'Hợp tác phát triển', 'Đồng hành cùng nhà sản xuất, đơn vị gia công và đối tác thương mại.', 'service-export-derivative.png'],
  ['truck', 'Đào tạo & chuyển giao', 'Chia sẻ kinh nghiệm, quy trình và giải pháp để phát triển bền vững.', 'service-logistics-derivative.png'],
];

const news = [
  ['news-1-derivative.png', 'NGUỒN HÀNG', '15/04/2025', 'Phát triển nguồn hàng Việt Nam cho thị trường quốc tế'],
  ['news-2-derivative.png', 'HỢP TÁC', '10/04/2025', 'Kết nối nhà sản xuất và đối tác cùng phát triển bền vững'],
  ['news-3-derivative.png', 'SẢN PHẨM', '05/04/2025', 'Từ sản phẩm chất lượng đến cơ hội thương mại phù hợp'],
];

const defaultHeroBanners = ['/assets/banner-1.jpg', '/assets/banner-2.jpg'];
type HomeLanguage = 'vi' | 'en';

const homeCopy = {
  vi: {
    ariaHome: 'GEDECO trang chủ', menu: 'Mở menu', search: 'Tìm kiếm', home: 'Trang chủ', about: 'Giới thiệu', news: 'Tin tức', products: 'Sản phẩm', contact: 'Liên hệ', domestic: 'Sản phẩm trong nước', export: 'Sản phẩm xuất khẩu', cta: 'Liên hệ ngay', heroEyebrow: 'GEDECO', heroTitle: 'Kết nối nguồn lực\nMở rộng giá trị', heroCopy: 'GEDECO phát triển nguồn hàng Việt Nam và kết nối sản phẩm chất lượng với khách hàng, đối tác trong nước và quốc tế.', explore: 'Khám phá sản phẩm', consult: 'Liên hệ tư vấn', highlights: [['Mở rộng thị trường','Kết nối doanh nghiệp toàn cầu'],['Đối tác tin cậy','Đồng hành phát triển bền vững'],['Giải pháp toàn diện','Từ nguồn hàng đến giao nhận'],['Đồng hành bền vững','Cùng phát triển lâu dài']], aboutTitle: 'CÔNG TY CỔ PHẦN GEDECO', aboutBody: ['Gedeco là một trong những Công ty kinh tế tư nhân đa ngành. Gedeco hoạt động trong 3 lĩnh vực kinh doanh cốt lõi, bao gồm: Nông nghiệp, Công nghiệp, Thương mại Dịch vụ.','Với mong muốn đem đến cho thị trường những sản phẩm – dịch vụ theo tiêu chuẩn quốc tế và những trải nghiệm hoàn toàn mới về phong cách sống hiện đại, ở bất cứ lĩnh vực nào Gedeco cũng chứng tỏ vai trò tiên phong, dẫn dắt sự thay đổi xu hướng tiêu dùng.'], learn: 'Tìm hiểu thêm về GEDECO', projectsTitle: 'Dự án tiêu biểu', projectsAll: 'Xem tất cả dự án →', projectMore: 'Xem chi tiết', productsTitle: 'Sản phẩm nổi bật', productsAll: 'Xem tất cả sản phẩm →', newsTitle: 'Tin tức nổi bật', newsPaused: 'Đang tạm dừng', newsAuto: 'Tự động chuyển tin', prev: 'Tin trước', next: 'Tin sau', read: 'Đọc thêm' },
  en: {
    ariaHome: 'GEDECO home', menu: 'Open menu', search: 'Search', home: 'Home', about: 'About', news: 'News', products: 'Products', contact: 'Contact', domestic: 'Domestic products', export: 'Export products', cta: 'Contact us', heroEyebrow: 'GEDECO', heroTitle: 'Connecting resources\nCreating value', heroCopy: 'GEDECO develops Vietnamese sources and connects quality products with customers and partners in Vietnam and worldwide.', explore: 'Explore products', consult: 'Contact us', highlights: [['Expanding markets','Connecting businesses worldwide'],['Trusted partner','Growing together sustainably'],['Complete solutions','From source to delivery'],['Long-term support','Building lasting relationships']], aboutTitle: 'GEDECO CORPORATION', aboutBody: ['GEDECO is a multi-sector private enterprise operating across agriculture, industry and trade services.','We bring internationally aligned products and services to the market while creating modern, practical and sustainable value for customers and partners.'], learn: 'Learn more about GEDECO', projectsTitle: 'Featured projects', projectsAll: 'View all projects →', projectMore: 'View project', productsTitle: 'Featured products', productsAll: 'View all products →', newsTitle: 'Featured news', newsPaused: 'Paused', newsAuto: 'Auto-playing news', prev: 'Previous news', next: 'Next news', read: 'Read more' },
} as const;

export default function HomePage({ language = 'vi' }: { language?: HomeLanguage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [newsSlide, setNewsSlide] = useState(0);
  const [newsPaused, setNewsPaused] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});
  const [chrome, setChrome] = useState<Record<string, ChromeValue>>({});
  const pathname = usePathname() || '/';
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
    const timer = window.setInterval(() => setHeroSlide((current) => (current + 1) % heroBanners.length), 6000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (newsPaused) return;
    const timer = window.setInterval(() => setNewsSlide((current) => current + 1), 5000);
    return () => window.clearInterval(timer);
  }, [newsPaused]);
  useEffect(() => {
    if (newsSlide !== news.length) return;
    const timer = window.setTimeout(() => setNewsSlide(0), 760);
    return () => window.clearTimeout(timer);
  }, [newsSlide]);
  useEffect(() => {
    fetch(`/api/site-content?page=home&lang=${language}`).then((response) => response.ok ? response.json() : null).then((payload) => {
      if (payload?.values) setContent({ ...payload.values, ...Object.fromEntries(Object.entries(payload.staticValues || {}).map(([key, value]) => [`static.${key}`, value as string])) });
    }).catch(() => undefined);
  }, []);
  useEffect(() => {
    Promise.all([
      fetch(`/api/site-chrome?area=HEADER&lang=${language}`).then((response) => response.ok ? response.json() : null),
      fetch(`/api/site-chrome?area=FOOTER&lang=${language}`).then((response) => response.ok ? response.json() : null),
    ]).then(([header, footer]) => setChrome({ ...(header?.values || {}), ...(footer?.values || {}) })).catch(() => undefined);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const chromeGet = (key: string, fallback: string) => language === 'en' ? fallback : (chrome[key]?.value || fallback);
  const chromeUrl = (key: string, fallback: string) => chrome[key]?.url || fallback;
  const heroTitle = language === 'en' ? copy.heroTitle : (content['hero.title'] || copy.heroTitle);
  const [heroLead, heroAccent = ''] = heroTitle.split(/\r?\n/);
  const heroBanners = [content['hero.banner1'] || defaultHeroBanners[0], content['hero.banner2'] || defaultHeroBanners[1]];
  const featuredProjects = language === 'en' ? [
    ['/assets/service-export-derivative.png', 'Agricultural source development', 'Building reliable Vietnamese agricultural sources.'],
    ['/assets/service-sourcing-derivative.png', 'Tea product cooperation', 'Connecting tea regions, processors and distribution partners.'],
    ['/assets/news-1-derivative.png', 'Export market connection', 'Supporting businesses as they prepare for new markets.'],
  ] : [
    [content['projects.1.image'] || '/assets/service-export-derivative.png', content['projects.1.title'] || 'Phát triển nguồn hàng nông sản', content['projects.1.copy'] || 'Xây dựng nguồn hàng Việt Nam có chất lượng và giá trị bền vững.'],
    [content['projects.2.image'] || '/assets/service-sourcing-derivative.png', content['projects.2.title'] || 'Hợp tác sản phẩm trà', content['projects.2.copy'] || 'Kết nối vùng nguyên liệu, đơn vị chế biến và đối tác phân phối.'],
    [content['projects.3.image'] || '/assets/news-1-derivative.png', content['projects.3.title'] || 'Kết nối xuất khẩu', content['projects.3.copy'] || 'Đồng hành cùng doanh nghiệp trong chuẩn bị và mở rộng thị trường.'],
  ];
  const carouselNews = [...news, ...news];
  return <>
    <header className="site-header" id="top"><div className="nav-shell">
      <a className="brand" href="#top" aria-label={copy.ariaHome}><img src="/assets/logo-new.png" alt={chrome['brand.logo']?.altText || 'GEDECO'} /></a>
      <button className="menu-toggle" aria-label={copy.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      <nav className={`main-nav${menuOpen ? ' open' : ''}`} aria-label="Điều hướng chính">
        <a className="active" href="#top" onClick={closeMenu}>{chromeGet('navigation.home', copy.home)}</a>
        <a href={language === 'en' ? '/en/about' : '/gioi-thieu'} onClick={closeMenu}>{chromeGet('navigation.about', copy.about)}</a>
        <a href={language === 'en' ? '/en/news' : '/tin-tuc'} onClick={closeMenu}>{chromeGet('navigation.news', copy.news)}</a>
        <div className="nav-dropdown"><a href={language === 'en' ? '/en/products' : '/san-pham'} onClick={closeMenu}>{chromeGet('navigation.products', copy.products)} <span className="nav-chevron" aria-hidden="true"><Icon name="chevron" /></span></a><div className="nav-submenu"><a href={`${language === 'en' ? '/en/products' : '/san-pham'}?category=trong-nuoc`} onClick={closeMenu}>{copy.domestic}</a><a href={`${language === 'en' ? '/en/products' : '/san-pham'}?category=xuat-khau`} onClick={closeMenu}>{copy.export}</a></div></div>
        <a href={language === 'en' ? '/en/contact' : '/lien-he'} onClick={closeMenu}>{chromeGet('navigation.contact', copy.contact)}</a>
      </nav>
      <div className="nav-tools"><button className="search-btn" aria-label={copy.search}><Icon name="search" /></button><LanguageSwitcher english={language === 'en'} /><a className="button button-gold button-small" href={chromeUrl('cta.label', language === 'en' ? '/en/contact' : '#contact')}>{chromeGet('cta.label', copy.cta)} <Icon name="arrow" /></a></div>
    </div></header>

    <main id="main-content">
      <section className="hero section-dark" style={{ backgroundImage: `url('${heroBanners[heroSlide]}')` }}><div className="hero-overlay" /><div className="hero-slide-controls" aria-label={copy.newsTitle}><button type="button" aria-label={copy.prev} onClick={() => setHeroSlide((current) => (current - 1 + heroBanners.length) % heroBanners.length)}>‹</button><button type="button" aria-label={copy.next} onClick={() => setHeroSlide((current) => (current + 1) % heroBanners.length)}>›</button></div><div className="hero-slide-dots" aria-label={copy.newsTitle}>{heroBanners.map((banner, index) => <button key={banner} type="button" className={heroSlide === index ? 'active' : ''} aria-label={`Banner ${index + 1}`} aria-pressed={heroSlide === index} onClick={() => setHeroSlide(index)} />)}</div><div className="container hero-content"><p className="eyebrow">{copy.heroEyebrow}</p><h1>{heroLead}<br /><em>{heroAccent}</em></h1><p className="hero-copy">{language === 'en' ? copy.heroCopy : (content['hero.copy'] || copy.heroCopy)}</p><div className="hero-actions"><a className="button button-gold" href={language === 'en' ? '/en/products' : '/san-pham'}>{copy.explore} <Icon name="arrow" /></a><a className="button button-outline" href={language === 'en' ? '/en/contact' : '/lien-he'}>{copy.consult}</a></div><div className="hero-highlights">{copy.highlights.map(([title, description], index) => <div key={title}><span className="highlight-icon"><Icon name={(['globe','handshake','chart','people'] as const)[index]} /></span><div><strong>{title}</strong><small>{description}</small></div></div>)}</div></div></section>
      <section className="about" id="about"><div className="container about-grid"><div className="about-image"><img src="/assets/banner-2.jpg" alt={copy.aboutTitle} /></div><div className="about-copy"><h2>{copy.aboutTitle}</h2><p>{copy.aboutBody[0]}</p><p>{copy.aboutBody[1]}</p><a className="button button-gold" href={language === 'en' ? '/en/about' : '/gioi-thieu'}>{copy.learn} <Icon name="arrow" /></a></div></div></section>
      <section className="home-projects"><div className="container"><div className="partner-head"><div><h2>{copy.projectsTitle}</h2></div><a href={language === 'en' ? '/en/projects' : '/du-an'}>{copy.projectsAll}</a></div><div className="home-project-grid">{featuredProjects.map(([image,title,projectCopy])=><article key={title}><img src={image} alt={title}/><div><h3>{title}</h3><p>{projectCopy}</p><a href={language === 'en' ? '/en/projects' : '/du-an'}>{copy.projectMore} <Icon name="arrow" /></a></div></article>)}</div></div></section>
      <section className="home-products" id="products"><div className="container"><div className="partner-head"><div><h2>{copy.productsTitle}</h2></div><a href={language === 'en' ? '/en/products' : '/san-pham'}>{copy.productsAll}</a></div><ProductCarousel compact language={language} /></div></section>
      <section className="news section-dark" id="news"><div className="container news-grid" aria-live="polite" onMouseEnter={() => setNewsPaused(true)} onMouseLeave={() => setNewsPaused(false)} onFocusCapture={() => setNewsPaused(true)} onBlurCapture={() => setNewsPaused(false)}><div className="news-intro"><h2>{copy.newsTitle}</h2><p className="news-auto-status">{newsPaused ? copy.newsPaused : copy.newsAuto}</p></div><div className="news-carousel"><div className="news-cards-track" style={{ transform: `translateX(calc(-${newsSlide * 33.333333}% - ${newsSlide * 4.666667}px))` }}>{carouselNews.map(([image, category, date, title], index) => <article className="news-card" key={`${title}-${index}`}><picture><source srcSet={`/assets/${image.replace('.png', '.optimized.webp')}`} type="image/webp" /><img src={`/assets/${image}`} alt={title} /></picture><small>{category}<span>{date}</span></small><h3>{title}</h3><a href={language === 'en' ? '/en/news' : '/tin-tuc'}>{copy.read} <Icon name="arrow" /></a></article>)}</div><div className="news-controls" aria-label={copy.newsTitle}><button type="button" aria-label={copy.prev} onClick={() => setNewsSlide((current) => current === 0 ? news.length - 1 : current - 1)}><Icon name="chevron" className="chevron-left" /></button><button type="button" aria-label={copy.next} onClick={() => setNewsSlide((current) => current + 1)}><Icon name="chevron" /></button></div></div></div></section>
    </main>

    <InnerFooter language={language} /><ContactActions />
  </>;
}
