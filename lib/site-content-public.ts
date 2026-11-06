import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { dynamicSeed } from "@/lib/dashboard/site-content-seed";

export async function getPublicSiteContent(pageKey: string) {
  const [page, dynamicRows, staticText] = await Promise.all([
    prisma.siteContentPage.findUnique({ where: { pageKey } }),
    prisma.siteDynamicContent.findMany({ where: { pageKey, isVisible: true }, orderBy: { sortOrder: "asc" } }),
    readFile(path.join(process.cwd(), "data", "site-static-content.json"), "utf8").then((value) => JSON.parse(value) as Array<{ pageKey: string; sectionKey: string; fieldKey: string; value: string; isVisible: boolean }>),
  ]);
  const staticRows = staticText.filter((row) => row.pageKey === pageKey && row.isVisible);
  const values = Object.fromEntries(dynamicRows.map((row) => [`${row.sectionKey}.${row.fieldKey}`, row.value]));
  for (const [seedPage, sectionKey, fieldKey, , value] of dynamicSeed) {
    if (seedPage === pageKey && values[`${sectionKey}.${fieldKey}`] === undefined) values[`${sectionKey}.${fieldKey}`] = value;
  }
  return {
    page,
    values,
    staticValues: Object.fromEntries(staticRows.map((row) => [`${row.sectionKey}.${row.fieldKey}`, row.value])),
  };
}
