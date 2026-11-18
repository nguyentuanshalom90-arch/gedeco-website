import { prisma } from "@/lib/prisma";
import { chromeSeed } from "@/lib/dashboard/site-chrome-seed";
import type { SiteChromeArea } from "@/lib/dashboard/site-chrome-types";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const requested = searchParams.get("area");
  const english = (searchParams.get("lang") || searchParams.get("locale")) === "en";
  const area: SiteChromeArea = requested === "FOOTER" ? "FOOTER" : "HEADER";
  const rows = await prisma.siteChromeContent.findMany({ where: { area }, orderBy: { sortOrder: "asc" } });
  const translations = english && rows.length ? await prisma.translationEntry.findMany({ where: { entityType: "SITE_CHROME", locale: "en", status: "TRANSLATED", entityId: { in: rows.map((row) => row.id) } } }) : [];
  const translatedById = new Map(translations.map((entry) => [entry.entityId, entry.payload as Record<string, unknown>]));
  const values: Record<string, { value: string; url: string; imageUrl: string; altText: string; caption: string }> = {};
  const existingKeys = new Set(rows.map((row) => `${row.sectionKey}.${row.fieldKey}`));
  for (const [seedArea, , sectionKey, fieldKey, , value, url, imageUrl, altText, isVisible] of chromeSeed) {
    const key = `${sectionKey}.${fieldKey}`;
    if (seedArea === area && isVisible && !existingKeys.has(key)) values[key] = { value: english ? "" : value, url, imageUrl, altText: english ? "" : altText, caption: "" };
  }
  for (const row of rows) {
    if (!row.isVisible) continue;
    const payload = translatedById.get(row.id);
    values[`${row.sectionKey}.${row.fieldKey}`] = {
      value: english ? (typeof payload?.value === "string" ? payload.value : "") : row.value,
      url: row.url ?? "",
      imageUrl: row.imageUrl ?? "",
      altText: english ? (typeof payload?.altText === "string" ? payload.altText : "") : row.altText ?? "",
      caption: english ? (typeof payload?.imageCaption === "string" ? payload.imageCaption : "") : row.imageCaption ?? "",
    };
  }
  return Response.json({ values }, { headers: { "Cache-Control": "no-store" } });
}
