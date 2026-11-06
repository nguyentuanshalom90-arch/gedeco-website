import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Icon,
  InnerPage,
} from "../../components/inner-pages";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

async function articleBySlug(slug: string) {
  const article = await prisma.newsArticle.findUnique({ where: { slug } });
  if (!article) return null;
  const visible =
    article.status === "PUBLISHED" ||
    (article.status === "SCHEDULED" &&
      article.scheduledAt &&
      article.scheduledAt <= new Date());
  return visible ? article : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await articleBySlug(slug);
  if (!article) return { title: "Không tìm thấy bài viết" };
  const title = article.metaTitle || article.title;
  const description =
    article.metaDescription || article.excerpt || siteConfig.defaultDescription;
  const canonical =
    article.canonicalUrl || absoluteUrl(`/tin-tuc/${article.slug}`);
  const image = article.ogImageUrl || article.imageUrl;
  return {
    title,
    description,
    keywords: article.tags,
    authors: article.authorName ? [{ name: article.authorName }] : undefined,
    alternates: { canonical },
    robots: { index: article.robotsIndex, follow: article.robotsFollow },
    openGraph: {
      type: "article",
      locale: "vi_VN",
      siteName: siteConfig.brand,
      url: canonical,
      title,
      description,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: image
        ? [{ url: absoluteUrl(image), alt: article.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [absoluteUrl(image)] : undefined,
    },
  };
}

function ArticleContent({ content }: { content: string | null }) {
  if (!content) return <p>Nội dung bài viết đang được cập nhật.</p>;
  return (
    <>
      {content.split(/\r?\n/).map((line, index) => {
        const key = `${index}-${line.slice(0, 20)}`;
        if (!line.trim()) return <br key={key} />;
        if (line.startsWith("### ")) return <h3 key={key}>{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={key}>{line.slice(3)}</h2>;
        if (line.startsWith("> "))
          return <blockquote key={key}>{line.slice(2)}</blockquote>;
        if (line.startsWith("- ")) return <p key={key}>• {line.slice(2)}</p>;
        return <p key={key}>{line}</p>;
      })}
    </>
  );
}

export default async function CmsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await articleBySlug(slug);
  if (!article) notFound();
  const related = await prisma.newsArticle.findMany({
    where: {
      id: { not: article.id },
      OR: [
        { status: "PUBLISHED" },
        { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
      ],
    },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
  });
  const published =
    article.publishedAt || article.scheduledAt || article.createdAt;
  const canonical =
    article.canonicalUrl || absoluteUrl(`/tin-tuc/${article.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription || article.excerpt || undefined,
    image:
      article.ogImageUrl || article.imageUrl
        ? [absoluteUrl(article.ogImageUrl || article.imageUrl!)]
        : undefined,
    datePublished: published.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: article.authorName || siteConfig.brand,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.brand,
      logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig.logo) },
    },
    mainEntityOfPage: canonical,
    keywords: article.tags.join(", "),
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteConfig.officialUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tin tức",
        item: absoluteUrl("/tin-tuc"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: canonical,
      },
    ],
  };
  return (
    <InnerPage active="Tin tức" pageClass="article-design">
      <section className="article-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(3,25,54,.88),rgba(3,25,54,.28)),url('${article.imageUrl || "/assets/banner-1.jpg"}')` }}>
        <div className="container">
          <nav className="article-breadcrumb" aria-label="Breadcrumb"><a href="/">Trang chủ</a><span>›</span><a href="/tin-tuc">Tin tức</a><span>›</span><span>{article.category}</span></nav>
          <p className="eyebrow">{article.category.toLocaleUpperCase("vi")}</p>
          <h1>{article.title}</h1>
          <div className="article-meta"><span>▣ {published.toLocaleDateString("vi-VN")}</span><span>◉ GEDECO</span><span>Chia sẻ:</span><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`} target="_blank" rel="noopener noreferrer" aria-label="Chia sẻ lên Facebook"><Icon name="facebook" /></a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`} target="_blank" rel="noopener noreferrer" aria-label="Chia sẻ lên LinkedIn"><Icon name="linkedin" /></a></div>
        </div>
      </section>
      <article className="article-layout">
        <div className="container article-grid">
          <div className="article-main">
            <p className="article-lead">{article.excerpt || "Cập nhật những câu chuyện và cơ hội mới nhất từ GEDECO."}</p>
            {article.imageUrl && (
              <img
                className="article-cover"
                src={article.imageUrl}
                alt={article.title}
              />
            )}
            <ArticleContent content={article.content} />
            <div className="article-tags"><strong>Từ khóa:</strong>{article.tags.map((tag) => <a key={tag} href={`/tin-tuc?tag=${encodeURIComponent(tag)}`}>#{tag}</a>)}</div>
            <div className="article-share">
              <span>Chia sẻ bài viết</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chia sẻ lên Facebook"
              >
                <Icon name="facebook" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chia sẻ lên LinkedIn"
              >
                <Icon name="linkedin" />
              </a>
            </div>
          </div>
          <aside className="article-side">
            <div className="side-box">
              <h3>Bài viết liên quan</h3>
              {related.map((item) => (
                <a className="article-related-item" key={item.id} href={`/tin-tuc/${item.slug}`}><img src={item.imageUrl || "/assets/news-1-derivative.png"} alt={item.title} /><span><b>{item.title}</b><small>{(item.publishedAt || item.scheduledAt || item.createdAt).toLocaleDateString("vi-VN")}</small></span></a>
              ))}
            </div>
            <div className="article-newsletter">
              <p className="eyebrow">CẬP NHẬT TỪ GEDECO</p><h3>Nhận bản tin GEDECO</h3><p>Cập nhật nhanh các tin tức, phân tích thị trường và cơ hội hợp tác.</p><form><input type="email" aria-label="Email nhận bản tin" placeholder="Nhập email của bạn" /><button type="button" aria-label="Đăng ký nhận bản tin"><Icon name="arrow" /></button></form>
            </div>
          </aside>
        </div>
        <div className="container article-nav"><a href="/tin-tuc">← <span>Bài viết trước</span><b>Trở lại danh sách tin tức</b></a><a href="/tin-tuc"> <span>Bài viết tiếp theo</span><b>Xem thêm bài viết mới</b> →</a></div>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, breadcrumbs]).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
    </InnerPage>
  );
}
