'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ContactActions } from './contact-actions';
import { LanguageSwitcher } from './language-switcher';

export type InnerIcon = 'globe' | 'handshake' | 'chart' | 'people' | 'box' | 'ship' | 'truck' | 'building' | 'search' | 'phone' | 'mail' | 'pin' | 'arrow' | 'chevron' | 'facebook' | 'music' | 'youtube' | 'linkedin' | 'check';

export function Icon({ name, className = '' }: { name: InnerIcon; className?: string }) {
  const common = { className: `icon-svg ${className}`, viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  const paths: Record<InnerIcon, React.ReactNode> = {
    globe: <><circle cx="24" cy="24" r="17" /><path d="M7 24h34M24 7c5 5 7 10 7 17s-2 12-7 17c-5-5-7-10-7-17s2-12 7-17ZM12 13c3 2 7 3 12 3s9-1 12-3M12 35c3-2 7-3 12-3s9 1 12 3" /></>,
    handshake: <><path d="m7 20 7-6 9 4 4-3 14 8-5 8-9-5-6 5-8-5-6 3-5-9 5-3Z" /><path d="m16 26 5 3 5-4 7 4M23 18l7 8" /></>,
    chart: <><path d="M8 39h32M12 35V25h7v10M22 35V18h7v17M32 35V10h7v25M10 19l10-7 8 3 10-8" /><path d="m32 8 6-1-2 6" /></>,
    people: <><circle cx="24" cy="16" r="5" /><circle cx="11" cy="19" r="4" /><circle cx="37" cy="19" r="4" /><path d="M14 38c0-7 4-11 10-11s10 4 10 11M5 37c0-5 2-8 6-8 2 0 4 1 5 3M43 37c0-5-2-8-6-8-2 0-4 1-5 3" /></>,
    box: <><path d="m24 7 15 8-15 8-15-8 15-8Z" /><path d="M9 15v17l15 9 15-9V15M24 23v18M16 11l15 8" /></>,
    ship: <><path d="M7 31h34l-5 7H12l-5-7ZM12 31V18h24v13M16 18V11h8v7M28 18v-5h5v5M5 42c4-3 7 3 11 0 4-3 7 3 11 0 4-3 7 3 11 0" /></>,
    truck: <><path d="M5 12h25v23H5zM30 22h7l6 6v7H30zM12 35a4 4 0 1 0 8 0M34 35a4 4 0 1 0 8 0" /></>,
    building: <><path d="M10 40V12l14-5v33M24 40h14V18l-14-4M15 17h4M15 24h4M15 31h4M29 23h4M29 30h4M29 37h4M7 40h34" /></>,
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
    check: <path d="m10 25 9 9 19-20" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const nav = [['Trang chủ', '/'], ['Giới thiệu', '/gioi-thieu'], ['Tin tức', '/tin-tuc'], ['Sản phẩm', '/san-pham'], ['Liên hệ', '/lien-he']];

export function InnerHeader({ active = '', language = 'vi' }: { active?: string; language?: 'vi' | 'en' }) {
  const english = language === 'en';
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || (english ? '/en' : '/');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chrome, setChrome] = useState<Record<string, { value: string; url: string; imageUrl: string; altText: string }>>({});
  useEffect(() => { fetch('/api/site-chrome?area=HEADER').then((response) => response.ok ? response.json() : null).then((payload) => { if (payload?.values) setChrome(payload.values); }).catch(() => undefined); }, []);
  useEffect(() => {
    const syncCategory = (event?: Event) => {
      const detail = (event as CustomEvent<{ category?: string }> | undefined)?.detail;
      const hasCategoryDetail = Boolean(detail && Object.prototype.hasOwnProperty.call(detail, 'category'));
      const value = hasCategoryDetail ? detail?.category : new URLSearchParams(window.location.search).get('category');
      const pathCategory = window.location.pathname.match(/^\/(?:en\/products|san-pham)\/(domestic|export|trong-nuoc|xuat-khau)(?:\/|$)/)?.[1];
      const selected = pathCategory || value;
      setSelectedCategory(selected === 'trong-nuoc' || selected === 'domestic' ? (english ? 'domestic' : 'trong-nuoc') : selected === 'xuat-khau' || selected === 'export' ? (english ? 'export' : 'xuat-khau') : '');
    };
    syncCategory();
    window.addEventListener('popstate', syncCategory);
    window.addEventListener('gedeco:product-category', syncCategory);
    return () => { window.removeEventListener('popstate', syncCategory); window.removeEventListener('gedeco:product-category', syncCategory); };
  }, [pathname]);
  const get = (key: string, fallback: string) => chrome[key]?.value || fallback;
  const getUrl = (key: string, fallback: string) => chrome[key]?.url || fallback;
  const logo = '/assets/logo-new.png';
  const urls = english ? { home: '/en', about: '/en/about', news: '/en/news', products: '/en/products', contact: '/en/contact' } : { home: getUrl('navigation.home', '/'), about: getUrl('navigation.about', '/gioi-thieu'), news: getUrl('navigation.news', '/tin-tuc'), products: getUrl('navigation.products', '/san-pham'), contact: getUrl('navigation.contact', '/lien-he') };
  const labels = english ? { home: 'Home', about: 'About', news: 'News', products: 'Products', contact: 'Contact', domestic: 'Domestic products', export: 'Export products', cta: 'Contact us' } : { home: get('navigation.home', 'Trang chủ'), about: get('navigation.about', 'Giới thiệu'), news: get('navigation.news', 'Tin tức'), products: get('navigation.products', 'Sản phẩm'), contact: get('navigation.contact', 'Liên hệ'), domestic: 'Sản phẩm trong nước', export: 'Sản phẩm xuất khẩu', cta: get('cta.label', 'Liên hệ ngay') };
  return <header className="site-header inner-header"><div className="nav-shell">
    <a className="brand" href={urls.home} aria-label={english ? 'GEDECO home' : 'GEDECO trang chủ'}><img src={logo} alt={chrome['brand.logo']?.altText || 'GEDECO'} /></a>
    <button className="menu-toggle" aria-label={english ? 'Open menu' : 'Mở menu'} aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /><span /></button>
    <nav className={`main-nav${open ? ' open' : ''}`} aria-label={english ? 'Main navigation' : 'Điều hướng chính'}><a className={active === (english ? 'Home' : 'Trang chủ') ? 'active' : ''} href={urls.home} onClick={() => setOpen(false)}>{labels.home}</a><a className={active === (english ? 'About' : 'Giới thiệu') ? 'active' : ''} href={urls.about} onClick={() => setOpen(false)}>{labels.about}</a><a className={active === (english ? 'News' : 'Tin tức') ? 'active' : ''} href={urls.news} onClick={() => setOpen(false)}>{labels.news}</a><div className="nav-dropdown"><a className={active === (english ? 'Products' : 'Sản phẩm') || Boolean(selectedCategory) ? 'active' : ''} href={urls.products} onClick={() => setOpen(false)}>{labels.products} <span className="nav-chevron" aria-hidden="true"><Icon name="chevron" /></span></a><div className="nav-submenu"><a className={selectedCategory === (english ? 'domestic' : 'trong-nuoc') ? 'active' : ''} href={`${urls.products}?category=${english ? 'domestic' : 'trong-nuoc'}`} onClick={() => setOpen(false)}>{labels.domestic}</a><a className={selectedCategory === (english ? 'export' : 'xuat-khau') ? 'active' : ''} href={`${urls.products}?category=${english ? 'export' : 'xuat-khau'}`} onClick={() => setOpen(false)}>{labels.export}</a></div></div><a className={active === (english ? 'Contact' : 'Liên hệ') ? 'active' : ''} href={urls.contact} onClick={() => setOpen(false)}>{labels.contact}</a></nav>
    <div className="nav-tools"><button className="search-btn" aria-label={english ? 'Search' : 'Tìm kiếm'}><Icon name="search" /></button><LanguageSwitcher english={english} /><a className="button button-gold button-small" href={urls.contact}>{labels.cta} <Icon name="arrow" /></a></div>
  </div></header>;
}

export function InnerFooter({ language = 'vi' }: { language?: 'vi' | 'en' }) {
  const english = language === 'en';
  const [chrome, setChrome] = useState<Record<string, { value: string; url: string; imageUrl: string; altText: string }>>({});
  useEffect(() => { fetch('/api/site-chrome?area=FOOTER').then((response) => response.ok ? response.json() : null).then((payload) => { if (payload?.values) setChrome(payload.values); }).catch(() => undefined); }, []);
  const get = (key: string, fallback: string) => chrome[key]?.value || fallback;
  const getUrl = (key: string, fallback: string) => chrome[key]?.url || fallback;
  const address = get('contact.address', 'Trụ sở: Tầng 14, Tòa nhà Đa năng, số 169 Nguyễn Ngọc Vũ, P. Yên Hòa, TP. Hà Nội, Việt Nam');
  const addressParts = address.split(', P. Yên Hòa');
  const urls = english ? { about: '/en/about', products: '/en/products', news: '/en/news', contact: '/en/contact' } : { about: '/gioi-thieu', products: '/san-pham', news: '/tin-tuc', contact: '/lien-he' };
  const labels = english ? { contact: 'CONTACT', quick: 'QUICK LINKS', support: 'SUPPORT', about: 'About us', products: 'Products', news: 'News', contactLink: 'Contact', cooperation: 'Business cooperation', quote: 'Request a quotation', registration: 'Business registration: 0109613491', tagline: 'Trade and export partner from Vietnam' } : { contact: 'THÔNG TIN LIÊN HỆ', quick: 'LIÊN KẾT NHANH', support: 'HỖ TRỢ', about: 'Giới thiệu', products: 'Sản phẩm', news: 'Tin tức', contactLink: 'Liên hệ', cooperation: 'Chính sách bảo mật thông tin', quote: 'Điều khoản sử dụng', registration: 'Mã số doanh nghiệp: 0109613491', tagline: 'GEDECO CORPORATION' };
  return <footer className="footer"><div className="container footer-grid home-footer-grid"><div className="footer-brand"><img src={chrome['brand.logo']?.imageUrl || '/assets/logo-new-footer.png'} alt={chrome['brand.logo']?.altText || 'GEDECO'} /><p>{english ? 'GEDECO CORPORATION' : get('brand.company', 'CÔNG TY CỔ PHẦN GEDECO')}<br /><i>{english ? labels.tagline : get('brand.tagline', labels.tagline)}</i></p><div className="socials"><a aria-label="Facebook" href={getUrl('social.facebook', 'https://www.facebook.com/www.gedeco.tra.thuong.hang')}><Icon name="facebook" /></a><a aria-label="YouTube" href={getUrl('social.youtube', '#')}><Icon name="youtube" /></a></div></div><div className="footer-info-columns"><div><h3>{labels.contact}</h3><a href={getUrl('contact.phone', 'tel:0914943653')}><Icon name="phone" />{get('contact.phone', '0914 94 3653')}</a><a href={getUrl('contact.email', 'mailto:info@gedeco.vn')}><Icon name="mail" />{get('contact.email', 'info@gedeco.vn')}</a><a href={urls.contact}><Icon name="pin" />{english ? <>14th Floor, Multifunctional Building, 169 Nguyen Ngoc Vu,<br />Yen Hoa Ward, Hanoi, Vietnam</> : (addressParts.length > 1 ? <>{addressParts[0]},<br />P. Yên Hòa{addressParts.slice(1).join(', P. Yên Hòa')}</> : address)}</a></div><div><h3>{labels.quick}</h3><a href={urls.about}>{labels.about}</a><a href={urls.products}>{labels.products}</a><a href={urls.news}>{labels.news}</a><a href={urls.contact}>{labels.contactLink}</a></div><div><h3>{labels.support}</h3><a href={urls.contact}>{labels.cooperation}</a><a href={urls.contact}>{labels.quote}</a></div></div></div><div className="container footer-bottom"><span>{labels.registration}</span></div></footer>;
}

export function InnerHero({ eyebrow, title, subtitle, image = '/assets/banner-1.jpg' }: { eyebrow: string; title: string; subtitle: string; image?: string }) {
  return <section className="inner-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(3,25,54,.86),rgba(3,25,54,.33)),url('${image}')` }}><div className="container"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div></section>;
}

export function InnerPage({ children, active, pageClass = '', language = 'vi' }: { children: React.ReactNode; active: string; pageClass?: string; language?: 'vi' | 'en' }) {
  return <div className={`inner-site ${pageClass}`}><InnerHeader active={active} language={language} /><main id="main-content" className="inner-main">{children}</main><InnerFooter language={language} /><ContactActions english={language === 'en'} /></div>;
}

export function CTA({ title = 'Hãy để chúng tôi đồng hành cùng bạn', text, language = 'vi' }: { title?: string; text?: string; language?: 'vi' | 'en' }) {
  const english = language === 'en';
  const body = text || (english ? 'Connect with GEDECO today to explore new cooperation and sustainable growth opportunities.' : 'Kết nối ngay hôm nay để tìm kiếm cơ hội hợp tác và phát triển bền vững trên toàn cầu.');
  return <section className="inner-cta"><div className="container"><p className="eyebrow">{english ? 'CONTACT GEDECO' : 'LIÊN HỆ VỚI GEDECO'}</p><h2>{title}</h2><p>{body}</p><div className="hero-actions"><a className="button button-gold" href={english ? '/en/contact' : '/lien-he'}>{english ? 'Contact us' : 'Liên hệ ngay'} <Icon name="arrow" /></a><a className="button button-outline light" href="mailto:info@gedeco.vn">{english ? 'Send an enquiry' : 'Gửi yêu cầu tư vấn'}</a></div></div></section>;
}

export function NewsCard({ item, href = '/tin-tuc/chi-tiet', excerpt = '', readLabel = 'Đọc thêm' }: { item: string[]; href?: string; excerpt?: string; readLabel?: string }) {
  const [image = '', category = '', date = '', title = ''] = item || [];
  const imageUrl = image.startsWith('/') ? image : `/assets/${image}`;
  return <article className="inner-news-card"><img src={imageUrl} alt={title} /><small>{category} <span>{date}</span></small><h3>{title}</h3>{excerpt && <p>{excerpt}</p>}<a href={href}>{readLabel} <Icon name="arrow" /></a></article>;
}
