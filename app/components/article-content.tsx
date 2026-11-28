import type { ReactNode } from "react";
import { runtimeEnv } from "@/lib/runtime-env";
import { sanitizeProductHtml } from "@/lib/sanitize-product-html";

const imagePattern = /^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/;
const inlinePattern = /(!?\[[^\]]+\]\([^\s)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;

function safeHref(value: string) {
  const href = value.trim();
  if (href.startsWith("/") || href.startsWith("#")) return href;
  try {
    const parsed = new URL(href);
    return ["https:", "mailto:", "tel:"].includes(parsed.protocol) && !parsed.username && !parsed.password ? href : null;
  } catch {
    return null;
  }
}

export function safeArticleImageSrc(value: string) {
  const src = value.trim();
  if (src.startsWith("/api/media/") || src.startsWith("/assets/") || src.startsWith("/uploads/")) return src;
  try {
    const parsed = new URL(src);
    const officialHost = new URL(runtimeEnv("SITE_URL") || "https://gedeco.vn").hostname.replace(/^www\./, "");
    return parsed.protocol === "https:" && parsed.hostname.replace(/^www\./, "") === officialHost && !parsed.username && !parsed.password ? src : null;
  } catch {
    return null;
  }
}

function inlineContent(value: string, keyPrefix: string): ReactNode[] {
  const parts = value.split(inlinePattern).filter(Boolean);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={key}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      return href ? <a key={key} href={href} target={href.startsWith("https://") ? "_blank" : undefined} rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}>{link[1]}</a> : <span key={key}>{link[1]}</span>;
    }
    return part;
  });
}

export function articleImageTokens(content: string) {
  return content.split(/\r?\n/).flatMap((line) => {
    const match = line.trim().match(imagePattern);
    return match ? [{ alt: match[1].trim(), src: match[2].trim(), caption: (match[3] || "").trim() }] : [];
  });
}

export function ArticleContent({ content, emptyText }: { content: string | null | undefined; emptyText: string }) {
  if (!content?.trim()) return <p>{emptyText}</p>;
  if (/<(?:p|div|span|h[1-6]|ul|ol|blockquote|figure|img|br)\b/i.test(content)) {
    return <div className="article-rich-html" dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(content) }} />;
  }
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    const key = `${index}-${line.slice(0, 24)}`;
    if (!line) {
      index += 1;
      continue;
    }
    const image = line.match(imagePattern);
    if (image) {
      const src = safeArticleImageSrc(image[2]);
      if (src && image[1].trim()) blocks.push(<figure className="article-inline-media" key={key}><img src={src} alt={image[1].trim()} />{image[3]?.trim() ? <figcaption>{image[3].trim()}</figcaption> : null}</figure>);
      index += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(<ul key={key}>{items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{inlineContent(item, `${key}-${itemIndex}`)}</li>)}</ul>);
      continue;
    }
    if (line.startsWith("### ")) blocks.push(<h3 key={key}>{inlineContent(line.slice(4), key)}</h3>);
    else if (line.startsWith("## ")) blocks.push(<h2 key={key}>{inlineContent(line.slice(3), key)}</h2>);
    else if (line.startsWith("> ")) blocks.push(<blockquote key={key}>{inlineContent(line.slice(2), key)}</blockquote>);
    else blocks.push(<p key={key}>{inlineContent(line, key)}</p>);
    index += 1;
  }
  return <>{blocks}</>;
}

export function ArticleExcerpt({ content, fallback }: { content: string | null | undefined; fallback: string }) {
  if (!content?.trim()) return <>{fallback}</>;
  if (/<(?:p|div|span|h[1-6]|ul|ol|blockquote|figure|img|br)\b/i.test(content)) {
    return <span className="article-rich-excerpt" dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(content) }} />;
  }
  return <>{content}</>;
}
