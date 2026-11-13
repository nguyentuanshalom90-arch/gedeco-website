import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { dynamicSeed } from "@/lib/dashboard/site-content-seed";

export async function getPublicSiteContent(pageKey: string, locale: "vi" | "en" = "vi") {
  const [page, dynamicRows, staticText] = await Promise.all([
    prisma.siteContentPage.findUnique({ where: { pageKey } }),
    prisma.siteDynamicContent.findMany({ where: { pageKey, isVisible: true }, orderBy: { sortOrder: "asc" } }),
    readFile(path.join(process.cwd(), "data", "site-static-content.json"), "utf8").then((value) => JSON.parse(value) as Array<{ id: string; pageKey: string; sectionKey: string; fieldKey: string; value: string; isVisible: boolean }>),
  ]);
  const staticRows = staticText.filter((row) => row.pageKey === pageKey && row.isVisible);
  const values = Object.fromEntries(dynamicRows.map((row) => [`${row.sectionKey}.${row.fieldKey}`, row.value]));
  for (const [seedPage, sectionKey, fieldKey, , value] of dynamicSeed) {
    if (seedPage === pageKey && values[`${sectionKey}.${fieldKey}`] === undefined) values[`${sectionKey}.${fieldKey}`] = value;
  }
  if (locale === "en") {
    const translatedKeys: string[] = [];
    const ids = [...dynamicRows.map((row) => row.id), ...staticRows.map((row) => row.id)];
    const entries = ids.length ? await prisma.translationEntry.findMany({ where: { entityType: "SITE_CONTENT", locale: "en", entityId: { in: ids }, status: "TRANSLATED" } }) : [];
    const byId = new Map(entries.map((entry) => [entry.entityId, entry]));
    for (const row of dynamicRows) {
      const payload = byId.get(row.id)?.payload;
      if (payload && typeof payload === "object" && typeof (payload as Record<string, unknown>).value === "string") { values[`${row.sectionKey}.${row.fieldKey}`] = (payload as Record<string, string>).value; translatedKeys.push(`${row.sectionKey}.${row.fieldKey}`); }
    }
    const staticValues = Object.fromEntries(staticRows.map((row) => {
      const payload = byId.get(row.id)?.payload;
      return [`${row.sectionKey}.${row.fieldKey}`, payload && typeof payload === "object" && typeof (payload as Record<string, unknown>).value === "string" ? (payload as Record<string, string>).value : row.value];
    }));
    const firstPayload = entries.find((entry) => entry.payload && typeof entry.payload === "object")?.payload as Record<string, unknown> | undefined;
    for (const row of staticRows) if (byId.get(row.id)) translatedKeys.push(`${row.sectionKey}.${row.fieldKey}`);
    return { page: page ? { ...page, h1: typeof firstPayload?.h1 === "string" && firstPayload.h1 ? firstPayload.h1 : page.h1, metaTitle: typeof firstPayload?.metaTitle === "string" && firstPayload.metaTitle ? firstPayload.metaTitle : page.metaTitle, metaDescription: typeof firstPayload?.metaDescription === "string" && firstPayload.metaDescription ? firstPayload.metaDescription : page.metaDescription } : page, values, staticValues, translatedKeys };
  }
  return {
    page,
    values,
    staticValues: Object.fromEntries(staticRows.map((row) => [`${row.sectionKey}.${row.fieldKey}`, row.value])),
    translatedKeys: [],
  };
}
