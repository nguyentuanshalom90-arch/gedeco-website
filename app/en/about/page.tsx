import type { Metadata } from 'next';
import SharedAboutPage from '../../components/about-page';

export const metadata: Metadata = { title: 'About GEDECO', description: 'GEDECO is a Vietnamese trade and export partner.', alternates: { canonical: '/en/about', languages: { vi: '/gioi-thieu', en: '/en/about' } } };

export default function AboutPageEnglish() {
  return <SharedAboutPage language="en" />;
}
