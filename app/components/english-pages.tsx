'use client';

import { useEffect } from 'react';
import { ContactActions } from './contact-actions';
import { InnerHeader, InnerFooter } from './inner-pages';

const nav = [['Home', '/en'], ['About', '/en/about'], ['News', '/en/news'], ['Contact', '/en/contact']];

export function EnglishHeader({ active = '' }: { active?: string }) {
  return <InnerHeader active={active} language="en" />;
}

export function EnglishFooter() {
  return <InnerFooter language="en" />;
}

export function EnglishPage({ children, active = '' }: { children: React.ReactNode; active?: string }) {
  useEffect(() => { document.documentElement.lang = 'en'; return () => { document.documentElement.lang = 'vi'; }; }, []);
  return <div className="inner-site english-site"><InnerHeader active={active} language="en" /><main id="main-content" className="inner-main">{children}</main><InnerFooter language="en" /><ContactActions english /></div>;
}
