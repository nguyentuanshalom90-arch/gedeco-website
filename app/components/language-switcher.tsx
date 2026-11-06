'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function VietnamFlag() {
  return <svg className="language-flag flag-vietnam" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" rx="1.5" fill="#DA251D" /><path fill="#FFCD00" d="m12 2.25.86 3.04 3.12.04-2.5 1.84.78 3.03L12 8.42 9.74 10.2l.78-3.03-2.5-1.84 3.12-.04L12 2.25Z" /></svg>;
}

function UnitedKingdomFlag() {
  return <svg className="language-flag flag-united-kingdom" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" rx="1.5" fill="#173B7A" /><path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3" /><path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" strokeWidth="1.15" /><path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" /><path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="2.2" /></svg>;
}

export function LanguageSwitcher({ english = false }: { english?: boolean }) {
  const pathname = usePathname() || '/';
  const vietnamesePath = pathname.replace(/^\/en/, '') || '/';
  const englishPath = `/en${pathname === '/' ? '' : pathname}`;
  return <div className="language-switcher" aria-label="Chuyển ngôn ngữ">
    {english ? <Link className="language-option language-option-vietnamese" href={vietnamesePath} aria-label="Tiếng Việt"><VietnamFlag /><span>VI</span></Link> : <span className="language-option language-option-vietnamese current" aria-label="Tiếng Việt"><VietnamFlag /><span>VI</span></span>}
    {english ? <span className="language-option language-option-english current" aria-label="English"><UnitedKingdomFlag /><span>EN</span></span> : <Link className="language-option language-option-english" href={englishPath} aria-label="English"><UnitedKingdomFlag /><span>EN</span></Link>}
  </div>;
}
