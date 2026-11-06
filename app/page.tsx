'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ContactActions } from './components/contact-actions';
import { LanguageSwitcher } from './components/language-switcher';

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

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [newsSlide, setNewsSlide] = useState(0);
  const [content, setContent] = useState<Record<string, string>>({});
  const [chrome, setChrome] = useState<Record<string, ChromeValue>>({});
  const pathname = usePathname() || '/';
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
    const timer = window.setInterval(() => setNewsSlide((current) => (current + 1) % news.length), 7000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    fetch('/api/site-content?page=home').then((response) => response.ok ? response.json() : null).then((payload) => {
      if (payload?.values) setContent({ ...payload.values, ...Object.fromEntries(Object.entries(payload.staticValues || {}).map(([key, value]) => [`static.${key}`, value as string])) });
    }).catch(() => undefined);
  }, []);
  useEffect(() => {
    Promise.all([
      fetch('/api/site-chrome?area=HEADER').then((response) => response.ok ? response.json() : null),
      fetch('/api/site-chrome?area=FOOTER').then((response) => response.ok ? response.json() : null),
    ]).then(([header, footer]) => setChrome({ ...(header?.values || {}), ...(footer?.values || {}) })).catch(() => undefined);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const chromeGet = (key: string, fallback: string) => chrome[key]?.value || fallback;
  const chromeUrl = (key: string, fallback: string) => chrome[key]?.url || fallback;
  const heroTitle = content['hero.title'] || 'Kết nối nguồn lực\nMở rộng giá trị';
  const [heroLead, heroAccent = ''] = heroTitle.split(/\r?\n/);
  const heroBanners = [content['hero.banner1'] || defaultHeroBanners[0], content['hero.banner2'] || defaultHeroBanners[1]];
  const featuredProjects = [
    [content['projects.1.image'] || '/assets/service-export-derivative.png', content['projects.1.title'] || 'Phát triển nguồn hàng nông sản', content['projects.1.copy'] || 'Xây dựng nguồn hàng Việt Nam có chất lượng và giá trị bền vững.'],
    [content['projects.2.image'] || '/assets/service-sourcing-derivative.png', content['projects.2.title'] || 'Hợp tác sản phẩm trà', content['projects.2.copy'] || 'Kết nối vùng nguyên liệu, đơn vị chế biến và đối tác phân phối.'],
    [content['projects.3.image'] || '/assets/news-1-derivative.png', content['projects.3.title'] || 'Kết nối xuất khẩu', content['projects.3.copy'] || 'Đồng hành cùng doanh nghiệp trong chuẩn bị và mở rộng thị trường.'],
  ];
  const visibleNews = [0, 1, 2].map((offset) => news[(newsSlide + offset) % news.length]);
  return <>
    <header className="site-header" id="top"><div className="nav-shell">
      <a className="brand" href="#top" aria-label="GEDECO trang chủ"><img src="/assets/logo-new.png" alt={chrome['brand.logo']?.altText || 'GEDECO'} /></a>
      <button className="menu-toggle" aria-label="Mở menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      <nav className={`main-nav${menuOpen ? ' open' : ''}`} aria-label="Điều hướng chính">
        {['home', 'about', 'services', 'partners', 'projects', 'news', 'contact'].map((key, index) => <a key={key} className={index === 0 ? 'active' : ''} href={chromeUrl(`navigation.${key}`, ['#top', '#about', '#services', '#partners', '/du-an', '#news', '#contact'][index])} onClick={closeMenu}>{chromeGet(`navigation.${key}`, content[`static.navigation.${key}`] || ['Trang chủ', 'Giới thiệu', 'Dịch vụ', 'Đối tác', 'Dự án', 'Tin tức', 'Liên hệ'][index])}</a>)}
      </nav>
      <div className="nav-tools"><button className="search-btn" aria-label="Tìm kiếm"><Icon name="search" /></button><LanguageSwitcher /><a className="button button-gold button-small" href={chromeUrl('cta.label', '#contact')}>{chromeGet('cta.label', 'Liên hệ ngay')} <Icon name="arrow" /></a></div>
    </div></header>

    <main id="main-content">
      <section className="hero section-dark" style={{ backgroundImage: `url('${heroBanners[heroSlide]}')` }}><div className="hero-overlay" /><div className="hero-slide-controls" aria-label="Điều hướng banner hero"><button type="button" aria-label="Banner trước" onClick={() => setHeroSlide((current) => (current - 1 + heroBanners.length) % heroBanners.length)}>‹</button><button type="button" aria-label="Banner tiếp theo" onClick={() => setHeroSlide((current) => (current + 1) % heroBanners.length)}>›</button></div><div className="hero-slide-dots" aria-label="Chuyển banner hero">{heroBanners.map((banner, index) => <button key={banner} type="button" className={heroSlide === index ? 'active' : ''} aria-label={`Banner ${index + 1}`} aria-pressed={heroSlide === index} onClick={() => setHeroSlide(index)} />)}</div><div className="container hero-content"><p className="eyebrow">GEDECO</p><h1>{heroLead}<br /><em>{heroAccent}</em></h1><p className="hero-copy">{content['hero.copy'] || 'GEDECO phát triển nguồn hàng Việt Nam và kết nối sản phẩm chất lượng với khách hàng, đối tác trong nước và quốc tế.'}</p><div className="hero-actions"><a className="button button-gold" href="#services">Khám phá dịch vụ <Icon name="arrow" /></a><a className="button button-outline" href="#contact">Liên hệ tư vấn</a></div><div className="hero-highlights"><div><span className="highlight-icon"><Icon name="globe" /></span><div><strong>Mở rộng thị trường</strong><small>Kết nối doanh nghiệp toàn cầu</small></div></div><div><span className="highlight-icon"><Icon name="handshake" /></span><div><strong>Đối tác tin cậy</strong><small>Đồng hành phát triển bền vững</small></div></div><div><span className="highlight-icon"><Icon name="chart" /></span><div><strong>Giải pháp toàn diện</strong><small>Từ nguồn hàng đến giao nhận</small></div></div><div><span className="highlight-icon"><Icon name="people" /></span><div><strong>Đồng hành bền vững</strong><small>Cùng phát triển lâu dài</small></div></div></div></div></section>
      <section className="about" id="about"><div className="container about-grid"><div className="about-image"><img src="/assets/banner-2.jpg" alt="Sản phẩm và hoạt động thương mại của GEDECO" /></div><div className="about-copy"><p className="eyebrow gold-text">VỀ GEDECO</p><h2>{content['about.title'] || 'Đồng hành cùng sản phẩm Việt vươn ra thị trường'}</h2><p>{content['about.copy'] || 'Từ phát triển nguồn hàng đến kết nối đối tác, GEDECO xây dựng các quan hệ thương mại minh bạch, chuyên nghiệp và bền vững.'}</p><a className="button button-gold" href="/gioi-thieu">Tìm hiểu thêm về GEDECO <Icon name="arrow" /></a></div></div></section>
      <section className="home-projects"><div className="container"><div className="partner-head"><div><p className="eyebrow gold-text">DỰ ÁN TIÊU BIỂU</p><h2>Những hoạt động hợp tác nổi bật</h2></div><a href="/du-an">Xem tất cả dự án →</a></div><div className="home-project-grid">{featuredProjects.map(([image,title,copy])=><article key={title}><img src={image} alt={title}/><div><h3>{title}</h3><p>{copy}</p><a href="/du-an">Xem chi tiết <Icon name="arrow" /></a></div></article>)}</div></div></section>
      <section className="services section-dark" id="services"><div className="container"><div className="section-heading centered"><p className="eyebrow">HOẠT ĐỘNG CỦA GEDECO</p><h2>{content['services.title'] || 'Giải pháp thương mại và xuất khẩu toàn diện'}</h2></div><div className="service-grid">{services.map(([icon, title, copy, image]) => <article className="service-card" key={title}><div className="service-icon"><Icon name={icon as IconName} /></div><h3>{title}</h3><p>{copy}</p><picture><source srcSet={`/assets/${image.replace('.png', '.optimized.webp')}`} type="image/webp" /><img src={`/assets/${image}`} alt={title} /></picture></article>)}</div></div></section>
      <section className="stats"><div className="container stats-grid"><div><Icon name="building" /><b>200+</b><span>Đối tác quốc tế</span></div><div><Icon name="globeAlt" /><b>30+</b><span>Thị trường kết nối</span></div><div><Icon name="handshakeAlt" /><b>500+</b><span>Dự án hỗ trợ thành công</span></div><div><Icon name="team" /><b>100+</b><span>Doanh nghiệp đồng hành</span></div></div></section>
      <section className="partners" id="partners"><div className="container"><div className="partner-head"><div><p className="eyebrow gold-text">ĐỐI TÁC TIÊU BIỂU</p><h2>Cùng nhau kiến tạo giá trị bền vững</h2></div><a href="/doi-tac">Xem tất cả đối tác →</a></div><div className="partner-logos"><span className="maersk"><img src="/assets/partners/maersk-cutout.png" alt="Maersk" /></span><span className="cma"><img src="/assets/partners/cma-cgm-cutout.png" alt="CMA CGM" /></span><span className="dhl"><img src="/assets/partners/dhl-cutout.png" alt="DHL" /></span><span className="kuehne"><img src="/assets/partners/kuehne-nagel-cutout.png" alt="Kuehne+Nagel" /></span><span className="oocl"><img src="/assets/partners/oocl-cutout.png" alt="OOCL" /></span><span className="hapag"><img src="/assets/partners/hapag-lloyd-cutout.png" alt="Hapag-Lloyd" /></span><span className="dpworld"><img src="/assets/partners/dp-world-cutout.png" alt="DP World" /></span></div></div></section>
      <section className="news section-dark" id="news"><div className="container news-grid"><div className="news-intro"><p className="eyebrow">TIN TỨC &amp; CHIA SẺ</p><h2>Cập nhật xu hướng<br />Kết nối cơ hội</h2></div>{visibleNews.map(([image, category, date, title]) => <article className="news-card" key={title}><picture><source srcSet={`/assets/${image.replace('.png', '.optimized.webp')}`} type="image/webp" /><img src={`/assets/${image}`} alt={title} /></picture><small>{category}<span>{date}</span></small><h3>{title}</h3><a href="/tin-tuc">Đọc thêm <Icon name="arrow" /></a></article>)}<div className="news-controls" aria-label="Điều hướng tin tức"><button type="button" aria-label="Tin trước" onClick={() => setNewsSlide((current) => (current - 1 + news.length) % news.length)}><Icon name="chevron" className="chevron-left" /></button><button type="button" aria-label="Tin sau" onClick={() => setNewsSlide((current) => (current + 1) % news.length)}><Icon name="chevron" /></button></div></div></section>
      <section className="contact-cta" id="contact"><div className="container contact-grid"><div><p className="eyebrow">LIÊN HỆ VỚI GEDECO</p><h2>{content['contact.title'] || 'Cùng GEDECO mở rộng cơ hội hợp tác'}</h2><p>Chia sẻ nhu cầu của bạn để GEDECO kết nối nguồn hàng, sản phẩm và đối tác phù hợp.</p><div className="hero-actions"><a className="button button-gold" href="tel:0914943653">Liên hệ ngay <Icon name="arrow" /></a><a className="button button-outline light" href="mailto:info@gedeco.vn">Gửi yêu cầu tư vấn</a></div></div><div className="contact-card"><p><Icon name="phone" />0914 94 3653</p><p><Icon name="mail" />info@gedeco.vn</p><p><Icon name="pin" />Số 60 Trung Kính,<br />P. Trung Hòa, Q. Cầu Giấy,<br />TP. Hà Nội, Việt Nam</p></div></div></section>
    </main>

    <footer className="footer"><div className="container footer-grid"><div className="footer-brand"><img src={chrome['brand.logo']?.imageUrl || '/assets/logo-new-footer.png'} alt={chrome['brand.logo']?.altText || 'GEDECO'} /><p>{chromeGet('brand.company', 'CÔNG TY CỔ PHẦN GEDECO')}<br /><i>{chromeGet('brand.tagline', 'GEDECO CORPORATION')}</i></p><div className="socials"><a aria-label="Facebook" href={chromeUrl('social.facebook', 'https://www.facebook.com/www.gedeco.tra.thuong.hang')}><Icon name="facebook" /></a><a aria-label="YouTube" href={chromeUrl('social.youtube', '#')}><Icon name="youtube" /></a></div></div><div><h3>VỀ GEDECO</h3><a href="#about">Giới thiệu</a><a href="#about">Tầm nhìn - Sứ mệnh</a><a href="#partners">Đối tác</a></div><div><h3>HOẠT ĐỘNG</h3><a href="#services">Xuất khẩu & sourcing</a><a href="#services">Thương mại & phân phối</a><a href="#services">Hợp tác phát triển</a><a href="#services">Đào tạo & chuyển giao</a></div><div><h3>TIN TỨC</h3><a href="#news">Nguồn hàng Việt</a><a href="#news">Sản phẩm</a><a href="#news">Hoạt động GEDECO</a></div><div><h3>LIÊN HỆ</h3><a href={chromeUrl('contact.phone', 'tel:0914943653')}><Icon name="phone" />{chromeGet('contact.phone', '0914 94 3653')}</a><a href={chromeUrl('contact.email', 'mailto:info@gedeco.vn')}><Icon name="mail" />{chromeGet('contact.email', 'info@gedeco.vn')}</a><a href={chromeUrl('contact.address', '#contact')}><Icon name="pin" />{chromeGet('contact.address', 'Số 60 Trung Kính, P. Trung Hòa, Q. Cầu Giấy, TP. Hà Nội, Việt Nam')}</a></div></div><div className="container footer-bottom"><span>{chromeGet('legal.copyright', '© 2025 GEDECO. All rights reserved.')}</span><span>Chính sách bảo mật &nbsp; | &nbsp; Điều khoản sử dụng &nbsp; | &nbsp; Liên hệ</span></div></footer><ContactActions />
  </>;
}
