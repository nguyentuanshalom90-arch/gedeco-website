import { EnglishPage } from '../../components/english-pages';
import { CTA, InnerHero, NewsCard } from '../../components/inner-pages';

const items = [
  ['news-1-derivative.png', 'SOURCE DEVELOPMENT', 'Vietnamese agricultural products and international markets', 'Businesses have more opportunities to reach international customers.'],
  ['news-2-derivative.png', 'COOPERATION', 'Connecting manufacturers with the right partners', 'Quality, transparency and shared goals are the basis of long-term cooperation.'],
  ['news-3-derivative.png', 'PRODUCTS', 'Quality and transparency in commercial cooperation', 'From product requirements to market opportunities, preparation matters.'],
  ['news-1-derivative.png', 'MARKET', 'New opportunities for Vietnamese products', 'Market insights help businesses prepare better for international demand.'],
  ['news-2-derivative.png', 'SUPPLY CHAIN', 'Building a more reliable supply chain', 'Clear standards and close coordination create sustainable value.'],
  ['news-3-derivative.png', 'INSIGHTS', 'Practical knowledge for business growth', 'Useful information supports confident commercial decisions.'],
  ['news-1-derivative.png', 'EXPORT', 'Preparing products for international markets', 'Clear product information and reliable delivery plans help partners move forward.'],
  ['news-2-derivative.png', 'PARTNERSHIP', 'Finding the right cooperation model', 'The right partners create stronger and more sustainable commercial opportunities.'],
  ['news-3-derivative.png', 'LOGISTICS', 'Planning a more efficient delivery journey', 'Practical logistics planning supports better service and long-term growth.'],
  ['news-1-derivative.png', 'QUALITY', 'Quality information builds market confidence', 'Consistent product standards make international cooperation more predictable.'],
  ['news-2-derivative.png', 'TRADE', 'From Vietnamese sources to global buyers', 'A clear commercial story helps the right products reach the right markets.'],
  ['news-3-derivative.png', 'NETWORK', 'Growing through trusted connections', 'Long-term partnerships start with shared expectations and transparent communication.'],
];

async function EnglishNewsPage({ searchParams }: { searchParams: Promise<{ trang?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.trang || '1', 10);
  const pageSize = 9;
  const pageCount = Math.ceil(items.length / pageSize);
  const safePage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pageCount) : 1;
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  return <EnglishPage active="News">
    <InnerHero eyebrow="NEWS & INSIGHTS" title="GEDECO news" subtitle="Market updates, Vietnamese products and cooperation opportunities" />
    <section className="inner-news-list"><div className="container">
      <div className="inner-title"><p className="eyebrow gold-text">LATEST UPDATES</p><h2>Information for better cooperation</h2></div>
      <nav className="news-filters" aria-label="Article categories"><a className="active" href="/en/news">All</a><a href="/en/news">News</a><a href="/en/news">Supply chain</a><a href="/en/news">GEDECO activities</a><a href="/en/news">Cooperation</a><a href="/en/news">Knowledge &amp; insights</a><a href="/en/news">Logistics</a><a href="/en/news">Market</a></nav>
      <div className="news-three-column-grid">{pageItems.map(([image, category, title, copy]) => <NewsCard key={title} item={[image, category, '2025', title]} excerpt={copy} href="/en/news/market-opportunities" readLabel="Read more" />)}</div>
      {pageCount > 1 && <nav className="news-pagination" aria-label="News pagination">{safePage > 1 && <a href={`/en/news?trang=${safePage - 1}`}>← Previous</a>}<span>Page {safePage} / {pageCount}</span>{safePage < pageCount && <a href={`/en/news?trang=${safePage + 1}`}>Next →</a>}</nav>}
    </div></section>
    <CTA language="en" title="Do not miss new opportunities" text="Stay connected with GEDECO and follow important market developments." />
  </EnglishPage>;
}

export default EnglishNewsPage;
