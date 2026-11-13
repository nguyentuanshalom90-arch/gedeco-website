'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function VietnamFlag() {
  return <svg className="language-flag flag-vietnam" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" rx="1.5" fill="#DA251D" /><path fill="#FFCD00" d="m12 2.25.86 3.04 3.12.04-2.5 1.84.78 3.03L12 8.42 9.74 10.2l.78-3.03-2.5-1.84 3.12-.04L12 2.25Z" /></svg>;
}

function UnitedKingdomFlag() {
  return <svg className="language-flag flag-united-kingdom" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" rx="1.5" fill="#173B7A" /><path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3" /><path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" strokeWidth="1.15" /><path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" /><path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="2.2" /></svg>;
}

export function LanguageSwitcher({ english = false }: { english?: boolean }) {
  const pathname = usePathname() || '/';
  const [queryString, setQueryString] = useState('');
  useEffect(() => {
    const syncQuery = () => setQueryString(window.location.search);
    syncQuery();
    window.addEventListener('popstate', syncQuery);
    window.addEventListener('gedeco:product-category', syncQuery);
    return () => {
      window.removeEventListener('popstate', syncQuery);
      window.removeEventListener('gedeco:product-category', syncQuery);
    };
  }, [pathname]);
  const routeMap: Record<string, string> = { '/gioi-thieu': '/about', '/tin-tuc/danh-muc': '/news/category', '/tin-tuc': '/news', '/du-an': '/projects', '/doi-tac': '/partners', '/lien-he': '/contact', '/san-pham': '/products', '/chinh-sach-bao-mat': '/privacy-policy', '/dieu-khoan-su-dung': '/terms-of-use', '/chinh-sach-ban-hang': '/sales-policy' };
  const translatePath = (path: string, toEnglish: boolean) => { const entries = Object.entries(routeMap); const match = entries.find(([vi, en]) => path === (toEnglish ? vi : en) || path.startsWith(`${toEnglish ? vi : en}/`)); if (!match) return path; const from = toEnglish ? match[0] : match[1]; const to = toEnglish ? match[1] : match[0]; return `${to}${path.slice(from.length)}`; };
  const basePath = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  const vietnamesePath = translatePath(basePath, false);
  const englishTarget = translatePath(basePath, true);
  const englishPath = `/en${englishTarget === '/' ? '' : englishTarget}`;
  const searchParams = new URLSearchParams(queryString);
  const category = searchParams.get('category');
  const translatedCategory = english
    ? (category === 'domestic' ? 'trong-nuoc' : category === 'export' ? 'xuat-khau' : category)
    : (category === 'trong-nuoc' ? 'domestic' : category === 'xuat-khau' ? 'export' : category);
  const query = new URLSearchParams(queryString);
  if (translatedCategory) query.set('category', translatedCategory); else query.delete('category');
  const querySuffix = query.toString() ? `?${query.toString()}` : '';
  return <div className="language-switcher" aria-label="Language switcher">
    {english ? <Link className="language-option language-option-vietnamese" href={`${vietnamesePath}${querySuffix}`} aria-label="Tiếng Việt"><VietnamFlag /><span>VI</span></Link> : <span className="language-option language-option-vietnamese current" aria-label="Tiếng Việt"><VietnamFlag /><span>VI</span></span>}
    {english ? <span className="language-option language-option-english current" aria-label="English"><UnitedKingdomFlag /><span>EN</span></span> : <Link className="language-option language-option-english" href={`${englishPath}${querySuffix}`} aria-label="English"><UnitedKingdomFlag /><span>EN</span></Link>}
  </div>;
}
