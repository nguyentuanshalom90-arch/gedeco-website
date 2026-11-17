import { getPublicSiteContent } from "@/lib/site-content-public";

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  const pageKey = search.get("page")?.trim();
  const locale = search.get("locale") === "en" || search.get("lang") === "en" ? "en" : "vi";
  if (!pageKey) return Response.json({ error: "Thiếu page key." }, { status: 400 });
  const { page, values, staticValues, media, translatedKeys } = await getPublicSiteContent(pageKey, locale);
  return Response.json({
    values,
    staticValues,
    media,
    translatedKeys,
    seo: page ? {
      h1: page.h1,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      canonicalUrl: page.canonicalUrl,
      robotsIndex: page.robotsIndex,
      robotsFollow: page.robotsFollow,
    } : null,
  }, { headers: { "Cache-Control": "no-store" } });
}
