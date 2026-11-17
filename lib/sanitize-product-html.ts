import sanitizeHtml from "sanitize-html";

const allowedMediaPath = /^(?:\/api\/media(?:\/|\?|$)|\/assets\/|\/uploads\/)/;

function isAllowedImageSource(value: string | undefined) {
  if (!value) return false;
  if (allowedMediaPath.test(value)) return true;
  try {
    const url = new URL(value);
    const official = new URL(process.env.SITE_URL || "https://gedeco.vn");
    return url.protocol === "https:" && url.hostname.replace(/^www\./, "") === official.hostname.replace(/^www\./, "") && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

export function sanitizeProductHtml(value: string) {
  return sanitizeHtml(value || "", {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "h4",
      "ul", "ol", "li", "blockquote", "a", "figure", "figcaption", "img",
      "table", "thead", "tbody", "tr", "th", "td", "hr", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
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
          loading: "lazy",
          alt: attributes.alt || "",
        },
      }),
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !isAllowedImageSource(frame.attribs.src),
  }).trim();
}
