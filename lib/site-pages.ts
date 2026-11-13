import { prisma } from "@/lib/prisma";

export type SitePageSection = {
  type: "hero" | "text" | "feature-grid" | "cta";
  eyebrow?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  items?: Array<{ title: string; body: string }>;
  buttonLabel?: string;
  buttonHref?: string;
};

export type PublicSitePage = {
  slug: string;
  name: string;
  title: string;
  excerpt: string;
  sections: SitePageSection[];
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
};

function asPage(value: { slug: string; name: string; title: string; excerpt: string | null; sections: unknown; metaTitle: string | null; metaDescription: string | null; canonicalUrl: string | null; robotsIndex: boolean; robotsFollow: boolean }): PublicSitePage {
  return {
    ...value,
    excerpt: value.excerpt || "",
    sections: Array.isArray(value.sections) ? value.sections as SitePageSection[] : [],
    metaTitle: value.metaTitle || value.title,
    metaDescription: value.metaDescription || value.excerpt || value.title,
    canonicalUrl: value.canonicalUrl || `/pages/${value.slug}`,
  };
}

export async function getPublicSitePage(slug: string, locale: "vi" | "en" = "vi") {
  const page = await prisma.sitePage.findUnique({ where: { slug } });
  if (!page || page.status !== "PUBLISHED") return null;
  if (locale === "vi") return asPage(page);

  const translation = await prisma.translationEntry.findUnique({
    where: { entityType_entityId_locale: { entityType: "SITE_PAGE", entityId: page.id, locale: "en" } },
  });
  if (!translation || translation.status !== "TRANSLATED" || !translation.payload || typeof translation.payload !== "object") return null;
  const payload = translation.payload as Record<string, unknown>;
  return asPage({ ...page, title: typeof payload.title === "string" ? payload.title : "", excerpt: typeof payload.excerpt === "string" ? payload.excerpt : "", sections: payload.sections, metaTitle: typeof payload.metaTitle === "string" ? payload.metaTitle : page.title, metaDescription: typeof payload.metaDescription === "string" ? payload.metaDescription : page.excerpt, canonicalUrl: `/en/pages/${page.slug}` });
}
