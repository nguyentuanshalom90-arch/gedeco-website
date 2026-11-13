import type { Metadata } from 'next';
import HomePage from '../page';

export const metadata: Metadata = { title: 'Trade and export from Vietnam', description: 'GEDECO develops Vietnamese sources and connects quality products with international customers and partners.', alternates: { canonical: '/en', languages: { vi: '/', en: '/en' } } };

export default function EnglishHome() {
  return <HomePage language="en" />;
}
