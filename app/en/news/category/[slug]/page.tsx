import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CTA, InnerHero, InnerPage, NewsCard } from '../../../../components/inner-pages';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const categoryLabels: Record<string, string> = {
  'Tin tức': 'News',
  'Chuỗi cung ứng': 'Supply chain',
  'Hoạt động GEDECO': 'GEDECO activities',
  'Hợp tác': 'Cooperation',
  'Kiến thức & chia sẻ': 'Knowledge & insights',
  Logistics: 'Logistics',
  'Thị trường': 'Market',
};

const fallbackArticles: Record<string, { title: string; excerpt: string }> = {
  'Thị trường': { title: 'New opportunities for Vietnamese products', excerpt: 'Market insights help businesses prepare better for international demand.' },
  'Chuỗi cung ứng': { title: 'Building a more reliable supply chain', excerpt: 'Clear standards and close coordination create sustainable value.' },
  'Hoạt động GEDECO': { title: 'From Vietnamese sources to global buyers', excerpt: 'A clear commercial story helps the right products reach the right markets.' },
  'Hợp tác': { title: 'Connecting manufacturers with the right partners', excerpt: 'Quality, transparency and shared goals are the basis of long-term cooperation.' },
  'Kiến thức & chia sẻ': { title: 'Preparing products for international markets', excerpt: 'Clear product information and reliable delivery plans help partners move forward.' },
  'Sản phẩm': { title: 'Quality and transparency in commercial cooperation', excerpt: 'From product requirements to market opportunities, preparation matters.' },
};

async function getCategory(slug: string) {
  return prisma.newsCategory.findUnique({ where: { slug }, include: { articles: true } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  return { title: category ? `${categoryLabels[category.name] || 'News'} | GEDECO` : 'News category | GEDECO' };
}

export default async function EnglishNewsCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const published = category.articles.filter((article) => article.status === 'PUBLISHED' || (article.status === 'SCHEDULED' && article.scheduledAt && article.scheduledAt <= new Date()));
  const ids = published.map((article) => article.id);
  const translations = ids.length ? await prisma.translationEntry.findMany({ where: { entityType: 'NEWS_ARTICLE', locale: 'en', entityId: { in: ids }, status: 'TRANSLATED' } }) : [];
  const byId = new Map(translations.map((entry) => [entry.entityId, (entry.payload || {}) as Record<string, string>]));
  const translatedCategoryTitle = translations.map((entry) => ((entry.payload || {}) as Record<string, string>).category).find(Boolean);
  const title = categoryLabels[category.name] || translatedCategoryTitle || 'GEDECO news';
  const cards = published.flatMap((article) => {
    const translated = byId.get(article.id);
    const fallback = fallbackArticles[category.name];
    if (!translated?.title && !fallback) return [];
    return [{ image: article.imageUrl || '/assets/news-1-derivative.png', category: translated?.category || title, date: (article.publishedAt || article.scheduledAt || article.createdAt).toLocaleDateString('en-GB'), title: translated?.title || fallback!.title, excerpt: translated?.excerpt || fallback!.excerpt }];
  });
  return <InnerPage active="News" language="en">
    <InnerHero eyebrow="NEWS CATEGORY" title={title} subtitle="Latest updates and insights from GEDECO." />
    <section className="inner-news-list"><div className="container"><div className="inner-title"><p className="eyebrow gold-text">LATEST UPDATES</p><h2>{title}</h2></div><div className="inner-news-grid">{cards.length ? cards.map((card) => <NewsCard key={card.title} item={[card.image, card.category, card.date, card.title]} excerpt={card.excerpt} href="/en/news" readLabel="Read more" />) : <p>English articles for this category are being prepared.</p>}</div></div></section>
    <CTA language="en" title="Stay connected with GEDECO" text="Contact us to discuss products, cooperation and market opportunities." />
  </InnerPage>;
}
