import { prisma } from "@/lib/prisma";
import { chromeSeed } from "@/lib/dashboard/site-chrome-seed";
import type { SiteChromeArea } from "@/lib/dashboard/site-chrome-types";

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("area");
  const area: SiteChromeArea = requested === "FOOTER" ? "FOOTER" : "HEADER";
  const rows = await prisma.siteChromeContent.findMany({ where: { area, isVisible: true }, orderBy: { sortOrder: "asc" } });
  const values: Record<string, { value: string; url: string; imageUrl: string; altText: string }> = {};
  for (const [seedArea, sectionKey, fieldKey, , value, url, imageUrl, altText] of chromeSeed) {
    if (seedArea === area) values[`${sectionKey}.${fieldKey}`] = { value, url, imageUrl, altText };
  }
  for (const row of rows) values[`${row.sectionKey}.${row.fieldKey}`] = { value: row.value, url: row.url ?? "", imageUrl: row.imageUrl ?? "", altText: row.altText ?? "" };
  return Response.json({ values }, { headers: { "Cache-Control": "no-store" } });
}
