import { getPublicSiteContent } from "@/lib/site-content-public";

export async function GET(request: Request) {
  const pageKey = new URL(request.url).searchParams.get("page")?.trim();
  if (!pageKey) return Response.json({ error: "Thiếu page key." }, { status: 400 });
  const { page, values, staticValues } = await getPublicSiteContent(pageKey);
  return Response.json({
    values,
    staticValues,
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
