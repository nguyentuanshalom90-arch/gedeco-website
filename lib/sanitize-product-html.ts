import sanitizeHtml from "sanitize-html";
import { runtimeEnv } from "./runtime-env.ts";

const allowedMediaPath = /^(?:\/api\/media(?:\/|\?|$)|\/assets\/|\/uploads\/)/;

// Older product records can contain mathematical-script Unicode characters
// copied from social posts. They look like a font but are actually different
// code points, so CSS/font changes cannot make them readable or translatable.
export function normalizeDecorativeUnicode(value: string) {
  return value.normalize("NFKD").normalize("NFC");
}

/**
 * Older editor data sometimes stored an image and its caption as two
 * `product-rich-video` figures. That class is intentionally centered for real
 * videos, so reusing it for an image makes the first content block drift to
 * the middle even when no image alignment was selected. Flatten only this
 * legacy shape; real YouTube figures still contain an iframe/frame and are
 * left untouched.
 */
export function normalizeLegacyMediaFigures(value: string) {
  let normalized = value || "";
  normalized = normalized.replace(
    /<figure\b([^>]*\bclass\s*=\s*["'][^"']*\bproduct-rich-video\b[^"']*["'][^>]*)>\s*<figure\b([^>]*)>([\s\S]*?)<\/figure>\s*<\/figure>/gi,
    (_match, _videoAttributes, imageAttributes, inner) => `<figure${imageAttributes}>${inner}</figure>`,
  );
  normalized = normalized.replace(
    /<figure\b([^>]*\bclass\s*=\s*["'][^"']*\bproduct-rich-video\b[^"']*["'][^>]*)>([\s\S]*?)<\/figure>/gi,
    (match, _attributes, inner) => /<iframe\b|product-rich-video-frame/i.test(inner) ? match : `<p>${inner}</p>`,
  );
  return normalized;
}

function optimizedAssetUrl(value: string) {
  return value.startsWith("/assets/") && /\.(?:png|jpe?g)$/i.test(value)
    ? value.replace(/\.(png|jpe?g)$/i, ".optimized.webp")
    : value;
}

function isAllowedImageSource(value: string | undefined) {
  if (!value) return false;
  if (allowedMediaPath.test(value)) return true;
  try {
    const url = new URL(value);
    const official = new URL(runtimeEnv("SITE_URL") || "https://gedeco.vn");
    return url.protocol === "https:" && url.hostname.replace(/^www\./, "") === official.hostname.replace(/^www\./, "") && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

export function sanitizeProductHtml(value: string) {
  const normalized = normalizeLegacyMediaFigures(normalizeDecorativeUnicode(value || ""));
  return sanitizeHtml(normalized, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "font", "span", "h2", "h3", "h4",
      "ul", "ol", "li", "blockquote", "a", "figure", "figcaption", "img",
      "table", "thead", "tbody", "tr", "th", "td", "hr", "code", "pre", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel", "class"],
      figure: ["class", "style"],
      img: ["src", "alt", "title", "class", "width", "height", "loading"],
      iframe: ["src", "title", "loading", "allow", "allowfullscreen", "referrerpolicy"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      font: ["face"],
      span: ["style"],
    },
    allowedSchemes: ["https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    allowedStyles: {
      span: {
        "font-size": [/^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/],
        color: [/^#[0-9a-f]{6}$/i],
        "background-color": [/^(?:#[0-9a-f]{6}|transparent)$/i],
      },
      figure: {
        width: [/^\d+(?:\.\d+)?px$/],
      },
    },
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...attributes,
          ...(attributes.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
        },
      }),
      img: (_tagName, attributes) => ({
        tagName: "img",
        attribs: {
          ...attributes,
          ...(attributes.src ? { src: optimizedAssetUrl(attributes.src) } : {}),
          loading: "lazy",
          alt: attributes.alt || "",
        },
      }),
      iframe: (_tagName, attributes) => {
        try {
          const url = new URL(attributes.src || "");
          const allowed = url.protocol === "https:" && url.hostname === "www.youtube-nocookie.com" && url.pathname.startsWith("/embed/") && !url.username && !url.password;
          return { tagName: "iframe", attribs: allowed ? { ...attributes, loading: "lazy", title: attributes.title || "Video YouTube" } : {} };
        } catch {
          return { tagName: "iframe", attribs: {} };
        }
      },
      font: (_tagName, attributes) => {
        // Product content is intentionally normalized to one readable sans-serif
        // family. Keep the text, but never reintroduce a decorative/serif face.
        void attributes;
        return { tagName: "span", attribs: {} };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !isAllowedImageSource(frame.attribs.src),
  }).trim();
}
