'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ContactActions } from './contact-actions';
import { LanguageSwitcher } from './language-switcher';
import { InnerHeader, InnerFooter } from './inner-pages';

const nav = [['Home', '/en'], ['About', '/en/about'], ['News', '/en/news'], ['Contact', '/en/contact']];

export function EnglishHeader({ active = '' }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || '/en';
  const productsActive = active === 'Products' || pathname.startsWith('/en/products');
  return <header className="site-header inner-header"><div className="nav-shell">
    <Link className="brand" href="/en" aria-label="GEDECO home"><img src="/assets/logo-new.png" alt="GEDECO" /></Link>
    <button className="menu-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /><span /></button>
    <nav className={`main-nav${open ? ' open' : ''}`} aria-label="Main navigation">{nav.slice(0, 3).map(([label, href]) => <Link key={label} className={active === label ? 'active' : ''} href={href} onClick={() => setOpen(false)}>{label}</Link>)}<div className="nav-dropdown"><Link className={productsActive ? 'active' : ''} href="/en/products" onClick={() => setOpen(false)}>Products <span className="nav-chevron" aria-hidden="true">⌄</span></Link><div className="nav-submenu"><Link className={pathname === '/en/products' && !pathname.includes('category=domestic') ? '' : ''} href="/en/products?category=domestic" onClick={() => setOpen(false)}>Domestic products</Link><Link href="/en/products?category=export" onClick={() => setOpen(false)}>Export products</Link></div></div><Link className={active === 'Contact' ? 'active' : ''} href="/en/contact" onClick={() => setOpen(false)}>Contact</Link></nav>
    <div className="nav-tools"><LanguageSwitcher english /><Link className="button button-gold button-small" href="/en/contact">Contact us <span>→</span></Link></div>
  </div></header>;
}

export function EnglishFooter() {
  return <footer className="footer"><div className="container footer-grid home-footer-grid"><div className="footer-brand"><img src="/assets/logo-new-footer.png" alt="GEDECO" /><p>GEDECO CORPORATION<br /><i>Trade and export partner from Vietnam</i></p></div><div className="footer-info-columns"><div><h3>CONTACT</h3><a href="tel:0914943653">0914 94 3653</a><a href="mailto:info@gedeco.vn">info@gedeco.vn</a><a href="/en/contact">169 Nguyen Ngoc Vu, Hanoi</a></div><div><h3>QUICK LINKS</h3><Link href="/en/about">About us</Link><Link href="/en/products">Products</Link><Link href="/en/news">News</Link><Link href="/en/contact">Contact</Link></div><div><h3>SUPPORT</h3><Link href="/en/contact">Business cooperation</Link><Link href="/en/contact">Request a quotation</Link></div></div></div><div className="container footer-bottom"><span>Business registration: 0109613491</span></div></footer>;
}

export function EnglishPage({ children, active = '' }: { children: React.ReactNode; active?: string }) {
  useEffect(() => { document.documentElement.lang = 'en'; return () => { document.documentElement.lang = 'vi'; }; }, []);
  return <div className="inner-site english-site"><InnerHeader active={active} language="en" /><main id="main-content" className="inner-main">{children}</main><InnerFooter language="en" /><ContactActions english /></div>;
}
