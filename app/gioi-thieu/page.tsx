import type { Metadata } from 'next';
import SharedAboutPage from '../components/about-page';

export const metadata: Metadata = { title: 'Giới thiệu', description: 'Giới thiệu Công ty Cổ phần GEDECO, các lĩnh vực hoạt động và giá trị theo đuổi.', alternates: { canonical: '/gioi-thieu' } };

export default function AboutPage() {
  return <SharedAboutPage />;
}
