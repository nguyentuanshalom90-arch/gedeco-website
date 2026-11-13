'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ContactActions } from './contact-actions';
import { InnerHeader, InnerFooter } from './inner-pages';

const nav = [['Home', '/en'], ['About', '/en/about'], ['News', '/en/news'], ['Contact', '/en/contact']];

export function EnglishHeader({ active = '' }: { active?: string }) {
  return <InnerHeader active={active} language="en" />;
}

export function EnglishFooter() {
  return <footer className="footer"><div className="container footer-grid home-footer-grid"><div className="footer-brand"><img src="/assets/logo-new-footer.png" alt="GEDECO" /><p>GEDECO CORPORATION<br /><i>Trade and export partner from Vietnam</i></p></div><div className="footer-info-columns"><div><h3>CONTACT</h3><a href="tel:0914943653">0914 94 3653</a><a href="mailto:info@gedeco.vn">info@gedeco.vn</a><a href="/en/contact">Floor 14, Da Nang Building, 169 Nguyen Ngoc Vu,<br />Yen Hoa Ward, Hanoi, Vietnam</a></div><div><h3>QUICK LINKS</h3><Link href="/en/about">About us</Link><Link href="/en/products">Products</Link><Link href="/en/news">News</Link><Link href="/en/contact">Contact</Link></div><div><h3>SUPPORT</h3><Link href="/en/contact">Business cooperation</Link><Link href="/en/contact">Request a quotation</Link></div></div></div><div className="container footer-bottom"><span>Business registration: 0109613491</span></div></footer>;
}

export function EnglishPage({ children, active = '' }: { children: React.ReactNode; active?: string }) {
  useEffect(() => { document.documentElement.lang = 'en'; return () => { document.documentElement.lang = 'vi'; }; }, []);
  return <div className="inner-site english-site"><InnerHeader active={active} language="en" /><main id="main-content" className="inner-main">{children}</main><InnerFooter language="en" /><ContactActions english /></div>;
}
