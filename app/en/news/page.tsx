import type { Metadata } from 'next';
import NewsPage from '../tin-tuc/page';

export const metadata: Metadata = { title: 'News & insights | GEDECO', description: 'Market updates, Vietnamese products and cooperation opportunities from GEDECO.', alternates: { canonical: '/en/news', languages: { vi: '/tin-tuc', en: '/en/news' } } };
export default NewsPage;
