import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

type TranslationPayload = Record<string, string>;

type ProductSource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  summaryHtml: string;
  contentHtml: string;
  priceText: string;
  stockText: string;
  category: "DOMESTIC" | "EXPORT";
  updatedAt: Date;
};

type ArticleSource = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  content: string | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  updatedAt: Date;
};

type SimpleContentSource = {
  id: string;
  label: string;
  value: string;
  altText?: string;
  h1?: string;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt: Date;
};

function hashSource(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

type TranslationProviderConfig = {
  provider: "libretranslate" | "google-cloud-translation";
  baseUrl: string;
  key?: string;
};

function getProviderConfig(): TranslationProviderConfig {
  const provider = (process.env.TRANSLATION_PROVIDER || "libretranslate").trim().toLowerCase();
  if (provider === "google" || provider === "google-cloud" || provider === "google-cloud-translation") {
    const key = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();
    if (!key) throw new Error("Google Translation chưa được cấu hình API key.");
    return { provider: "google-cloud-translation", baseUrl: "https://translation.googleapis.com/language/translate/v2", key };
  }
  if (provider !== "libretranslate") throw new Error(`Translation provider không được hỗ trợ: ${provider}`);
  return {
    provider: "libretranslate",
    baseUrl: (process.env.LIBRETRANSLATE_URL || "http://127.0.0.1:5000").replace(/\/$/, ""),
    key: process.env.LIBRETRANSLATE_API_KEY?.trim() || undefined,
  };
}

async function translateText(text: string, config: TranslationProviderConfig) {
  if (!text.trim()) return text;
  if (config.provider === "google-cloud-translation") {
    const response = await fetch(`${config.baseUrl}?key=${encodeURIComponent(config.key || "")}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: text, source: "vi", target: "en", format: "text" }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const payload = (await response.json().catch(() => ({}))) as { data?: { translations?: Array<{ translatedText?: string }> }; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message || `Google Translation trả về ${response.status}.`);
    return payload.data?.translations?.[0]?.translatedText || text;
  }

  const response = await fetch(`${config.baseUrl}/translate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q: text, source: "vi", target: "en", format: "text", ...(config.key ? { api_key: config.key } : {}) }),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const payload = (await response.json().catch(() => ({}))) as { translatedText?: string; error?: string };
  if (!response.ok) throw new Error(payload.error || `LibreTranslate trả về ${response.status}.`);
  return payload.translatedText || text;
}

async function translateHtml(html: string, config: TranslationProviderConfig) {
  if (!html.trim()) return html;
  if (config.provider === "libretranslate") {
    const response = await fetch(`${config.baseUrl}/translate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: html, source: "vi", target: "en", format: "html", ...(config.key ? { api_key: config.key } : {}) }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const payload = (await response.json().catch(() => ({}))) as { translatedText?: string; error?: string };
    if (!response.ok) throw new Error(payload.error || `LibreTranslate trả về ${response.status}.`);
    return payload.translatedText || html;
  }
  const parts = html.split(/(<[^>]+>)/g);
  const translated: string[] = [];
  for (const part of parts) {
    if (!part || /^<[^>]+>$/.test(part) || !part.trim()) translated.push(part);
    else translated.push(await translateText(part, config));
  }
  return translated.join("");
}

export async function translateProduct(source: ProductSource) {
  const config = getProviderConfig();
  const [title, description, summaryHtml, contentHtml, priceText, stockText] = await Promise.all([
    translateText(source.title, config),
    translateText(source.description, config),
    translateHtml(source.summaryHtml, config),
    translateHtml(source.contentHtml, config),
    translateText(source.priceText, config),
    translateText(source.stockText, config),
  ]);
  return {
    provider: config.provider,
    payload: { title, description, summaryHtml, contentHtml, priceText, stockText, category: source.category === "EXPORT" ? "Export products" : "Domestic products" },
    slug: slugify(title),
  };
}

export async function translateArticle(source: ArticleSource) {
  const config = getProviderConfig();
  const [title, category, excerpt, content, metaTitle, metaDescription, focusKeyword] = await Promise.all([
    translateText(source.title, config),
    translateText(source.category, config),
    translateText(source.excerpt || "", config),
    translateHtml(source.content || "", config),
    translateText(source.metaTitle || source.title, config),
    translateText(source.metaDescription || source.excerpt || "", config),
    translateText(source.focusKeyword || "", config),
  ]);
  const tags = await Promise.all(source.tags.map((tag) => translateText(tag, config)));
  return { provider: config.provider, payload: { title, category, excerpt, content, metaTitle, metaDescription, focusKeyword, tags: JSON.stringify(tags) }, slug: slugify(title) };
}

type TranslationEntityType = "PRODUCT" | "NEWS_ARTICLE" | "SITE_CONTENT" | "SITE_CHROME";

async function saveFailure(entityType: TranslationEntityType, entityId: string, sourceUpdatedAt: Date, sourceHash: string, errorMessage: string) {
  return prisma.translationEntry.upsert({
    where: { entityType_entityId_locale: { entityType, entityId, locale: "en" } },
    create: { entityType, entityId, locale: "en", payload: {}, sourceUpdatedAt, sourceHash, status: "FAILED", errorMessage },
    update: { sourceUpdatedAt, sourceHash, status: "FAILED", errorMessage },
  });
}

async function syncSimpleContentTranslation(entityType: "SITE_CONTENT" | "SITE_CHROME", source: SimpleContentSource) {
  const sourceHash = hashSource({ label: source.label, value: source.value, altText: source.altText || "", h1: source.h1 || "", metaTitle: source.metaTitle || "", metaDescription: source.metaDescription || "" });
  const current = await prisma.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType, entityId: source.id, locale: "en" } } });
  if (current?.sourceHash === sourceHash && current.status === "TRANSLATED") return current;
  if (current?.manualOverride) return prisma.translationEntry.update({ where: { id: current.id }, data: { sourceUpdatedAt: source.updatedAt, sourceHash, status: "NEEDS_REVIEW", errorMessage: null } });
  try {
    const config = getProviderConfig();
    const [label, value, altText, h1, metaTitle, metaDescription] = await Promise.all([
      translateText(source.label, config),
      translateHtml(source.value, config),
      translateText(source.altText || "", config),
      translateText(source.h1 || "", config),
      translateText(source.metaTitle || "", config),
      translateText(source.metaDescription || "", config),
    ]);
    return prisma.translationEntry.upsert({
      where: { entityType_entityId_locale: { entityType, entityId: source.id, locale: "en" } },
      create: { entityType, entityId: source.id, locale: "en", payload: { label, value, altText, h1, metaTitle, metaDescription }, sourceUpdatedAt: source.updatedAt, sourceHash, status: "TRANSLATED", provider: config.provider, translatedAt: new Date() },
      update: { payload: { label, value, altText, h1, metaTitle, metaDescription }, sourceUpdatedAt: source.updatedAt, sourceHash, status: "TRANSLATED", provider: config.provider, errorMessage: null, translatedAt: new Date() },
    });
  } catch (error) {
    return saveFailure(entityType, source.id, source.updatedAt, sourceHash, error instanceof Error ? error.message : "Unknown translation error.");
  }
}

export function syncSiteContentTranslation(source: SimpleContentSource) {
  return syncSimpleContentTranslation("SITE_CONTENT", source);
}

export function syncSiteChromeTranslation(source: SimpleContentSource) {
  return syncSimpleContentTranslation("SITE_CHROME", source);
}

export async function syncProductTranslation(source: ProductSource) {
  const sourceHash = hashSource({ title: source.title, description: source.description, summaryHtml: source.summaryHtml, contentHtml: source.contentHtml, priceText: source.priceText, stockText: source.stockText, category: source.category });
  const current = await prisma.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: source.id, locale: "en" } } });
  if (current?.sourceHash === sourceHash && current.status === "TRANSLATED") return current;
  if (current?.manualOverride) return prisma.translationEntry.update({ where: { id: current.id }, data: { sourceUpdatedAt: source.updatedAt, sourceHash, status: "NEEDS_REVIEW", errorMessage: null } });
  try {
    const translated = await translateProduct(source);
    return prisma.translationEntry.upsert({
      where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: source.id, locale: "en" } },
      create: { entityType: "PRODUCT", entityId: source.id, locale: "en", slug: translated.slug, payload: translated.payload, sourceUpdatedAt: source.updatedAt, sourceHash, status: "TRANSLATED", provider: translated.provider, translatedAt: new Date() },
      update: { slug: translated.slug, payload: translated.payload, sourceUpdatedAt: source.updatedAt, sourceHash, status: "TRANSLATED", provider: translated.provider, errorMessage: null, translatedAt: new Date() },
    });
  } catch (error) {
    return saveFailure("PRODUCT", source.id, source.updatedAt, sourceHash, error instanceof Error ? error.message : "Unknown translation error.");
  }
}

export async function syncArticleTranslation(source: ArticleSource) {
  const sourceHash = hashSource({ title: source.title, category: source.category, excerpt: source.excerpt, content: source.content, tags: source.tags, metaTitle: source.metaTitle, metaDescription: source.metaDescription, focusKeyword: source.focusKeyword });
  const current = await prisma.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "NEWS_ARTICLE", entityId: source.id, locale: "en" } } });
  if (current?.sourceHash === sourceHash && current.status === "TRANSLATED") return current;
  if (current?.manualOverride) return prisma.translationEntry.update({ where: { id: current.id }, data: { sourceUpdatedAt: source.updatedAt, sourceHash, status: "NEEDS_REVIEW", errorMessage: null } });
  try {
    const translated = await translateArticle(source);
    return prisma.translationEntry.upsert({
      where: { entityType_entityId_locale: { entityType: "NEWS_ARTICLE", entityId: source.id, locale: "en" } },
      create: { entityType: "NEWS_ARTICLE", entityId: source.id, locale: "en", slug: translated.slug, payload: translated.payload, sourceUpdatedAt: source.updatedAt, sourceHash, status: "TRANSLATED", provider: translated.provider, translatedAt: new Date() },
      update: { slug: translated.slug, payload: translated.payload, sourceUpdatedAt: source.updatedAt, sourceHash, status: "TRANSLATED", provider: translated.provider, errorMessage: null, translatedAt: new Date() },
    });
  } catch (error) {
    return saveFailure("NEWS_ARTICLE", source.id, source.updatedAt, sourceHash, error instanceof Error ? error.message : "Unknown translation error.");
  }
}
