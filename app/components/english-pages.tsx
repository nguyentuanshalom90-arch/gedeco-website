'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ContactActions } from './contact-actions';
import { LanguageSwitcher } from './language-switcher';

const nav = [['Home', '/en'], ['About', '/en/gioi-thieu'], ['Activities', '/en#services'], ['Partners', '/en/doi-tac'], ['Projects', '/en/du-an'], ['News', '/en/tin-tuc'], ['Contact', '/en/lien-he']];

export function EnglishHeader({ active = '' }: { active?: string }) {
  return <header className="site-header inner-header"><div className="nav-shell">
    <Link className="brand" href="/en" aria-label="GEDECO home"><img src="/assets/logo-new.png" alt="GEDECO" /></Link>
    <nav className="main-nav" aria-label="Main navigation">{nav.map(([label, href]) => <Link key={label} className={active === label ? 'active' : ''} href={href}>{label}</Link>)}</nav>
    <div className="nav-tools"><LanguageSwitcher english /><Link className="button button-gold button-small" href="/en/lien-he">Contact us <span>→</span></Link></div>
  </div></header>;
}

export function EnglishFooter() {
  return <footer className="footer"><div className="container footer-grid"><div className="footer-brand"><img src="/assets/logo-new-footer.png" alt="GEDECO" /><p>GEDECO CORPORATION<br /><i>Trade and export partner from Vietnam</i></p></div><div><h3>ABOUT GEDECO</h3><Link href="/en/gioi-thieu">About us</Link><Link href="/en/doi-tac">Partners</Link></div><div><h3>ACTIVITIES</h3><Link href="/en#services">Export & sourcing</Link><Link href="/en#services">Trade & distribution</Link><Link href="/en#services">Business cooperation</Link></div><div><h3>NEWS</h3><Link href="/en/tin-tuc">Vietnamese products</Link><Link href="/en/tin-tuc">Market updates</Link></div><div><h3>CONTACT</h3><a href="tel:0914943653">0914 94 3653</a><a href="mailto:info@gedeco.vn">info@gedeco.vn</a><span>60 Trung Kính, Cau Giay, Hanoi, Vietnam</span></div></div><div className="container footer-bottom"><span>© 2025 GEDECO. All rights reserved.</span><span>Privacy policy &nbsp; | &nbsp; Terms of use</span></div></footer>;
}

export function EnglishPage({ children, active = '' }: { children: React.ReactNode; active?: string }) {
  useEffect(() => { document.documentElement.lang = 'en'; return () => { document.documentElement.lang = 'vi'; }; }, []);
  return <div className="inner-site english-site"><EnglishHeader active={active} /><main id="main-content" className="inner-main">{children}</main><EnglishFooter /><ContactActions english /></div>;
}
