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

const productEnglishSlugs: Record<string, string> = {
  'tra-dinh-thuong-hang-uop-sen': 'premium-ding-tea-with-lotus',
  'tieu-den': 'black-pepper',
  'ca-phe-robusta': 'robusta-coffee',
  'ca-phe-arabica': 'arabica-coffee',
  'ruou-dong-trung-ha-thao': 'cordyceps-liquor',
  'dong-trung-ha-thao-nguyen-con': 'whole-cordyceps',
  'bot-matcha-huu-co': 'organic-matcha-powder',
  'tra-dinh-uop-gao-sen': 'ding-tea-with-lotus-rice',
  'dia-spithera-xoa-sach-nep-nhan': 'dia-spithera-wrinkle-care',
  'tra-dinh-thuong-hang-uop-hoa-buoi': 'premium-ding-tea-with-pomelo-blossom',
  'tra-hoa-vang-rung': 'wild-tam-dao-golden-flower-tea',
  'tra-uop-hoa-soi': 'wolf-flower-scented-tea',
  'nhat-pham-tra-nhai-tra-dinh-uop-hoa-nhai': 'premium-ding-tea-traditional-flavor',
  'tra-dinh-uop-hoa-nhai': 'premium-ding-tea-with-jasmine',
  'tra-dinh-uop-bong-sen': 'premium-lotus-tea-box-10',
  durian: 'durian',
  'thuc-pham-bao-ve-suc-khoe-carositol': 'carositol-korean-health-supplement',
  'canned-pineapple': 'canned-pineapple',
  'ca-tra-dau': 'fresh-ginger-dried-sliced-ginger',
};

const productSourceByEnglishSlug = Object.fromEntries(Object.entries(productEnglishSlugs).map(([source, english]) => [english, source]));

function translateProductPath(path: string, toEnglish: boolean) {
  if (toEnglish) {
    const match = path.match(/^\/san-pham\/(?:trong-nuoc|xuat-khau)\/([^/]+)$/) || path.match(/^\/san-pham\/([^/]+)$/);
    if (!match) return null;
    const category = path.includes('/xuat-khau/') ? 'export' : 'domestic';
    return `/products/${category}/${productEnglishSlugs[match[1]] || match[1]}`;
  }
  const match = path.match(/^\/products\/(?:domestic|export)\/([^/]+)$/) || path.match(/^\/products\/([^/]+)$/);
  if (!match) return null;
  const category = path.includes('/export/') ? 'xuat-khau' : 'trong-nuoc';
  return `/san-pham/${category}/${productSourceByEnglishSlug[match[1]] || match[1]}`;
}

function normalizeLanguagePath(path: string, routeMap: Record<string, string>) {
  const base = path.replace(/^\/en(?=\/|$)/, '') || '/';
  const productPath = base.match(/^\/san-pham\/(?:trong-nuoc|xuat-khau)\/([^/]+)$/) || base.match(/^\/san-pham\/([^/]+)$/);
  if (productPath) return `/product/${productPath[1]}`;
  const englishProductPath = base.match(/^\/products\/(?:domestic|export)\/([^/]+)$/) || base.match(/^\/products\/([^/]+)$/);
  if (englishProductPath) return `/product/${productSourceByEnglishSlug[englishProductPath[1]] || englishProductPath[1]}`;
  const entry = Object.entries(routeMap).find(([vi, en]) => base === vi || base === en || base.startsWith(`${vi}/`) || base.startsWith(`${en}/`));
  if (!entry) return base;
  const source = base === entry[1] || base.startsWith(`${entry[1]}/`) ? entry[1] : entry[0];
  return `${entry[0]}${base.slice(source.length)}`;
}

export function LanguageSwitcher({ english = false, alternateEnglishPath, alternateVietnamesePath }: { english?: boolean; alternateEnglishPath?: string | null; alternateVietnamesePath?: string | null }) {
  const pathname = usePathname() || '/';
  const [queryString, setQueryString] = useState('');
  const scrollStorageKey = 'gedeco:language-scroll-position';

  const rememberScrollPosition = () => {
    sessionStorage.setItem(scrollStorageKey, JSON.stringify({ path: pathname, x: window.scrollX, y: window.scrollY }));
  };

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

  useEffect(() => {
    const savedPosition = sessionStorage.getItem(scrollStorageKey);
    if (!savedPosition) return;

    try {
      const { path: savedPath, x, y } = JSON.parse(savedPosition) as { path?: string; x: number; y: number };
      if (!savedPath || normalizeLanguagePath(savedPath, routeMap) !== normalizeLanguagePath(pathname, routeMap)) return;
      sessionStorage.removeItem(scrollStorageKey);
      window.setTimeout(() => {
        requestAnimationFrame(() => {
          const root = document.documentElement;
          const previousScrollBehavior = root.style.scrollBehavior;
          const restore = () => {
            root.style.scrollBehavior = 'auto';
            window.scrollTo({ left: x, top: y, behavior: 'auto' });
          };
          restore();
          window.setTimeout(restore, 150);
          window.setTimeout(() => { root.style.scrollBehavior = previousScrollBehavior; }, 220);
        });
      }, 400);
    } catch {
      sessionStorage.removeItem(scrollStorageKey);
    }
  }, [pathname]);
  const routeMap: Record<string, string> = { '/gioi-thieu': '/about', '/tin-tuc/danh-muc': '/news/category', '/tin-tuc': '/news', '/lien-he': '/contact', '/san-pham': '/products', '/chinh-sach-bao-mat': '/privacy-policy', '/dieu-khoan-su-dung': '/terms-of-use', '/chinh-sach-ban-hang': '/sales-policy', '/chinh-sach-hang-chinh-hang': '/authentic-product-policy', '/huong-dan-mua-hang': '/how-to-order', '/giao-hang-va-thanh-toan': '/shipping-and-payment', '/doi-tra-va-bao-hanh': '/returns-and-warranty' };
  const translatePath = (path: string, toEnglish: boolean) => { const entries = Object.entries(routeMap); const match = entries.find(([vi, en]) => path === (toEnglish ? vi : en) || path.startsWith(`${toEnglish ? vi : en}/`)); if (!match) return path; const from = toEnglish ? match[0] : match[1]; const to = toEnglish ? match[1] : match[0]; return `${to}${path.slice(from.length)}`; };
  const basePath = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  const vietnamesePath = translatePath(basePath, false);
  const translatedProductPath = translateProductPath(basePath, true);
  const translatedVietnameseProductPath = translateProductPath(basePath, false);
  const englishTarget = translatedProductPath || translatePath(basePath, true);
  const vietnameseTarget = translatedVietnameseProductPath || vietnamesePath;
  const englishPath = alternateEnglishPath === undefined ? `/en${englishTarget === '/' ? '' : englishTarget}` : alternateEnglishPath;
  const resolvedVietnamesePath = alternateVietnamesePath === undefined ? vietnameseTarget : alternateVietnamesePath;
  const searchParams = new URLSearchParams(queryString);
  const category = searchParams.get('category');
  const translatedCategory = english
    ? (category === 'domestic' ? 'trong-nuoc' : category === 'export' ? 'xuat-khau' : category)
    : (category === 'trong-nuoc' ? 'domestic' : category === 'xuat-khau' ? 'export' : category);
  const query = new URLSearchParams(queryString);
  if (translatedCategory) query.set('category', translatedCategory); else query.delete('category');
  const querySuffix = query.toString() ? `?${query.toString()}` : '';
  return <div className="language-switcher" aria-label="Language switcher">
    {english ? (resolvedVietnamesePath ? <Link scroll={false} onPointerDown={rememberScrollPosition} onClick={rememberScrollPosition} className="language-option language-option-vietnamese" href={`${resolvedVietnamesePath}${querySuffix}`} aria-label="Tiếng Việt"><VietnamFlag /><span>VI</span></Link> : <span className="language-option language-option-vietnamese unavailable" aria-label="Chưa có bản tiếng Việt" aria-disabled="true"><VietnamFlag /><span>VI</span></span>) : <span className="language-option language-option-vietnamese current" aria-label="Tiếng Việt"><VietnamFlag /><span>VI</span></span>}
    {english ? <span className="language-option language-option-english current" aria-label="English"><UnitedKingdomFlag /><span>EN</span></span> : (englishPath ? <Link scroll={false} onPointerDown={rememberScrollPosition} onClick={rememberScrollPosition} className="language-option language-option-english" href={`${englishPath}${querySuffix}`} aria-label="English"><UnitedKingdomFlag /><span>EN</span></Link> : <span className="language-option language-option-english unavailable" aria-label="English chưa có bản dịch" aria-disabled="true"><UnitedKingdomFlag /><span>EN</span></span>)}
  </div>;
}
