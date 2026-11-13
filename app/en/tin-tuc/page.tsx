import type { Metadata } from 'next';
import { CTA, InnerHero, InnerPage, NewsCard } from '../../components/inner-pages';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'News & insights | GEDECO', description: 'Market updates, Vietnamese products and cooperation opportunities from GEDECO.', alternates: { canonical: '/en/news', languages: { vi: '/tin-tuc', en: '/en/news' } } };

const categoryMap: Record<string, string> = { 'Tin tức': 'News', 'Nguồn hàng': 'Source development', 'Hoạt động GEDECO': 'GEDECO activities', 'Sản phẩm': 'Products', 'Hợp tác': 'Cooperation', 'Thị trường': 'Market', 'Kiến thức & chia sẻ': 'Knowledge & insights' };
const sourceTranslations: Record<string, { title: string; excerpt: string }> = {
  'bai-viet-kiem-thu-module': { title: 'Article module test', excerpt: 'Short description for the article module test.' },
  'xay-dung-chuoi-cung-ung-linh-hoat': { title: 'Building a stable source for Vietnamese products', excerpt: 'A stable source and transparent process are the foundation for sustainable trade growth.' },
  'tu-nguon-hang-den-giao-nhan-cung-mot-dau-moi': { title: 'From source to market: connecting with GEDECO', excerpt: 'A single coordination point helps businesses follow the journey from source development to customer connection.' },
  'logistics-xanh-xu-huong-phat-trien-ben-vung': { title: 'Sustainable products and new consumer trends', excerpt: 'Consumers increasingly care about origin, quality and responsibility throughout a product’s life cycle.' },
  'ket-noi-doanh-nghiep-viet-nhat-mo-rong-hop-tac': { title: 'Connecting Vietnamese businesses and international partners', excerpt: 'Trust, transparency and market understanding are the foundation of long-term cooperation.' },
  'co-hoi-xuat-khau-nong-san-viet-sang-chau-au-2026': { title: 'Opportunities to bring Vietnamese agricultural products to international markets', excerpt: 'Quality sources, clear origin and a strong product story are creating more opportunities for Vietnamese agriculture.' },
  'ho-so-xuat-khau-can-chuan-bi-nhung-gi': { title: 'What should Vietnamese products prepare before export?', excerpt: 'Standardising product information, specifications and documents is important before approaching international partners.' },
};
const fallbackNews = [
  { image: '/assets/news-1-derivative.png', category: 'Market', date: '15/04/2025', title: 'Opportunities to export Vietnamese products to European markets in 2025', excerpt: 'Market developments and practical solutions help businesses improve their competitiveness.', href: '/en/news/chi-tiet' },
  { image: '/assets/news-2-derivative.png', category: 'Cooperation', date: '10/04/2025', title: 'Strengthening connections between Vietnamese and Japanese businesses', excerpt: 'Market developments and practical solutions help businesses improve their competitiveness.', href: '/en/news/chi-tiet' },
  { image: '/assets/news-3-derivative.png', category: 'Logistics', date: '05/04/2025', title: 'Optimising logistics costs in a changing global context', excerpt: 'Market developments and practical solutions help businesses improve their competitiveness.', href: '/en/news/chi-tiet' },
  { image: '/assets/news-1-derivative.png', category: 'Logistics', date: '2025', title: 'Green logistics – an essential trend for sustainable development', excerpt: 'Market developments and practical solutions help businesses improve their competitiveness.', href: '/en/news/chi-tiet' },
  { image: '/assets/news-2-derivative.png', category: 'Market', date: '2025', title: 'Global trade prospects in 2025', excerpt: 'Market developments and practical solutions help businesses improve their competitiveness.', href: '/en/news/chi-tiet' },
  { image: '/assets/news-3-derivative.png', category: 'Cooperation', date: '2025', title: 'GEDECO supports exporters as they expand into new markets', excerpt: 'Market developments and practical solutions help businesses improve their competitiveness.', href: '/en/news/chi-tiet' },
];

export default async function EnglishNewsPage({ searchParams }: { searchParams: Promise<{ trang?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.trang || '1', 10);
  const pageSize = 9;
  const articles = await prisma.newsArticle.findMany({ where: { OR: [{ status: 'PUBLISHED' }, { status: 'SCHEDULED', scheduledAt: { lte: new Date() } }] }, orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }], take: 100 });
  const ids = articles.map((article) => article.id);
  const entries = ids.length ? await prisma.translationEntry.findMany({ where: { entityType: 'NEWS_ARTICLE', locale: 'en', entityId: { in: ids }, status: 'TRANSLATED' } }) : [];
  const translatedById = new Map(entries.map((entry) => [entry.entityId, (entry.payload || {}) as Record<string, string>]));
  const items = articles.flatMap((article) => {
    const payload = translatedById.get(article.id);
    const fallback = sourceTranslations[article.slug];
    const title = payload?.title || fallback?.title;
    const excerpt = payload?.excerpt || fallback?.excerpt;
    if (!title || !excerpt) return [];
    return [{ image: article.imageUrl || '/assets/news-1-derivative.png', category: payload?.category || categoryMap[article.category] || article.category, date: (article.publishedAt || article.scheduledAt || article.createdAt).toLocaleDateString('en-GB'), title, excerpt, href: `/en/news/${article.slug}` }];
  });
  const allItems = [...items, ...fallbackNews];
  const pageCount = Math.max(1, Math.ceil(allItems.length / pageSize));
  const safePage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pageCount) : 1;
  const pageItems = allItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  return <InnerPage active="News" language="en">
    <InnerHero eyebrow="NEWS & INSIGHTS" title="GEDECO news" subtitle="Market updates, Vietnamese products and cooperation opportunities" />
    <section className="inner-news-list"><div className="container"><div className="inner-title"><p className="eyebrow gold-text">LATEST UPDATES</p><h2>Information for better cooperation</h2></div><nav className="news-filters" aria-label="Article categories"><a className="active" href="/en/news">All</a><a href="/en/news">News</a><a href="/en/news">Source development</a><a href="/en/news">GEDECO activities</a><a href="/en/news">Cooperation</a><a href="/en/news">Knowledge &amp; insights</a><a href="/en/news">Market</a></nav><div className="news-three-column-grid">{pageItems.map((item) => <NewsCard key={item.href} item={[item.image, item.category, item.date, item.title]} excerpt={item.excerpt} href={item.href} readLabel="Read more" />)}</div>{pageCount > 1 && <nav className="news-pagination" aria-label="News pagination">{safePage > 1 && <a href={`/en/news?trang=${safePage - 1}`}>← Previous</a>}<span>Page {safePage} / {pageCount}</span>{safePage < pageCount && <a href={`/en/news?trang=${safePage + 1}`}>Next →</a>}</nav>}</div></section>
    <CTA language="en" title="Do not miss new opportunities" text="Stay connected with GEDECO and follow important market developments." />
  </InnerPage>;
}
