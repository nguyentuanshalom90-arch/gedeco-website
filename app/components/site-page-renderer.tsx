import Link from "next/link";
import type { PublicSitePage } from "@/lib/site-pages";

export function SitePageRenderer({ page, language }: { page: PublicSitePage; language: "vi" | "en" }) {
  const isEnglish = language === "en";
  return (
    <main className="site-page-shell">
      {page.sections.map((section, index) => {
        if (section.type === "hero") return <section className="site-page-hero" key={`${section.type}-${index}`}><div className="site-page-container"><div className="site-page-hero-copy"><span className="eyebrow">{section.eyebrow}</span><h1>{section.title || page.title}</h1><p>{section.body || page.excerpt}</p></div>{section.imageUrl ? <img src={section.imageUrl} alt={section.imageAlt || section.title || page.title} /> : null}</div></section>;
        if (section.type === "feature-grid") return <section className="site-page-section" key={`${section.type}-${index}`}><div className="site-page-container"><h2>{section.title}</h2><p className="site-page-lead">{section.body}</p><div className="site-page-feature-grid">{(section.items || []).map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></div></section>;
        if (section.type === "cta") return <section className="site-page-cta" key={`${section.type}-${index}`}><div className="site-page-container"><div><span className="eyebrow">{section.eyebrow}</span><h2>{section.title}</h2><p>{section.body}</p></div>{section.buttonLabel && section.buttonHref ? <Link href={section.buttonHref}>{section.buttonLabel}<span aria-hidden="true"> →</span></Link> : null}</div></section>;
        return <section className="site-page-section" key={`${section.type}-${index}`}><div className="site-page-container"><h2>{section.title}</h2><p>{section.body}</p></div></section>;
      })}
      <span className="sr-only">{isEnglish ? "English page" : "Trang tiếng Việt"}</span>
    </main>
  );
}
