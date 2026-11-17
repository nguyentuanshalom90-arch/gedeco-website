import { getFeaturedNews } from "@/lib/featured-news";

export async function GET(request: Request) {
  const language = new URL(request.url).searchParams.get("lang") === "en" ? "en" : "vi";
  return Response.json({ items: await getFeaturedNews(language) }, { headers: { "Cache-Control": "no-store" } });
}
