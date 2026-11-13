'use client';

import { usePathname } from 'next/navigation';

export function LanguageAwareSkipLink() {
  const pathname = usePathname() || '/';
  const english = pathname === '/en' || pathname.startsWith('/en/');
  return <a className="skip-link" href="#main-content">{english ? 'Skip to main content' : 'Bỏ qua đến nội dung chính'}</a>;
}
