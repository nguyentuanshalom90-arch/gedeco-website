import { prisma } from "@/lib/prisma";
import { dynamicSeed } from "@/lib/dashboard/site-content-seed";
import { ensureSiteContentSeeded } from "@/lib/site-content-seeding";

export async function getPublicSiteContent(pageKey: string, locale: "vi" | "en" = "vi") {
  await ensureSiteContentSeeded();
  const [page, allRows] = await Promise.all([
    prisma.siteContentPage.findUnique({ where: { pageKey } }),
    prisma.siteDynamicContent.findMany({ where: { pageKey }, orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] }),
  ]);
  const rows = allRows.filter((row) => row.isVisible);
  const existingKeys = new Set(allRows.map((row) => `${row.kind}.${row.sectionKey}.${row.fieldKey}`));
  const dynamicRows = rows.filter((row) => row.kind === "DYNAMIC");
  const staticRows = rows.filter((row) => row.kind === "STATIC");
  const values = Object.fromEntries(dynamicRows.map((row) => [`${row.sectionKey}.${row.fieldKey}`, row.value]));
  const media = Object.fromEntries(rows.filter((row) => row.imageUrl).map((row) => [`${row.kind === "STATIC" ? "static." : ""}${row.sectionKey}.${row.fieldKey}`, { url: row.imageUrl || "", altText: row.altText || "", caption: row.imageCaption || "" }]));
  for (const [seedPage, sectionKey, fieldKey, , value] of dynamicSeed) {
    const key = `DYNAMIC.${sectionKey}.${fieldKey}`;
    if (seedPage === pageKey && !existingKeys.has(key)) values[`${sectionKey}.${fieldKey}`] = value;
  }
  if (locale === "en") {
    const translatedKeys: string[] = [];
    const ids = [...dynamicRows.map((row) => row.id), ...staticRows.map((row) => row.id)];
    const entries = ids.length ? await prisma.translationEntry.findMany({ where: { entityType: "SITE_CONTENT", locale: "en", entityId: { in: ids }, status: "TRANSLATED" } }) : [];
    const byId = new Map(entries.map((entry) => [entry.entityId, entry]));
    for (const row of dynamicRows) {
      const payload = byId.get(row.id)?.payload;
      if (payload && typeof payload === "object" && typeof (payload as Record<string, unknown>).value === "string") { values[`${row.sectionKey}.${row.fieldKey}`] = (payload as Record<string, string>).value; translatedKeys.push(`${row.sectionKey}.${row.fieldKey}`); }
      if (payload && typeof payload === "object" && media[`${row.sectionKey}.${row.fieldKey}`]) media[`${row.sectionKey}.${row.fieldKey}`] = { ...media[`${row.sectionKey}.${row.fieldKey}`], altText: typeof (payload as Record<string, unknown>).altText === "string" ? (payload as Record<string, string>).altText : media[`${row.sectionKey}.${row.fieldKey}`].altText, caption: typeof (payload as Record<string, unknown>).imageCaption === "string" ? (payload as Record<string, string>).imageCaption : media[`${row.sectionKey}.${row.fieldKey}`].caption };
    }
    const staticValues = Object.fromEntries(staticRows.map((row) => {
      const payload = byId.get(row.id)?.payload;
      return [`${row.sectionKey}.${row.fieldKey}`, payload && typeof payload === "object" && typeof (payload as Record<string, unknown>).value === "string" ? (payload as Record<string, string>).value : row.value];
    }));
    const firstPayload = entries.find((entry) => entry.payload && typeof entry.payload === "object")?.payload as Record<string, unknown> | undefined;
    for (const row of staticRows) if (byId.get(row.id)) translatedKeys.push(`${row.sectionKey}.${row.fieldKey}`);
    for (const row of staticRows) {
      const payload = byId.get(row.id)?.payload;
      const key = `static.${row.sectionKey}.${row.fieldKey}`;
      if (payload && typeof payload === "object" && media[key]) media[key] = { ...media[key], altText: typeof (payload as Record<string, unknown>).altText === "string" ? (payload as Record<string, string>).altText : media[key].altText, caption: typeof (payload as Record<string, unknown>).imageCaption === "string" ? (payload as Record<string, string>).imageCaption : media[key].caption };
    }
    return { page: page ? { ...page, h1: typeof firstPayload?.h1 === "string" && firstPayload.h1 ? firstPayload.h1 : page.h1, metaTitle: typeof firstPayload?.metaTitle === "string" && firstPayload.metaTitle ? firstPayload.metaTitle : page.metaTitle, metaDescription: typeof firstPayload?.metaDescription === "string" && firstPayload.metaDescription ? firstPayload.metaDescription : page.metaDescription } : page, values, staticValues, media, translatedKeys };
  }
  return {
    page,
    values,
    staticValues: Object.fromEntries(staticRows.map((row) => [`${row.sectionKey}.${row.fieldKey}`, row.value])),
    media,
    translatedKeys: [],
  };
}
