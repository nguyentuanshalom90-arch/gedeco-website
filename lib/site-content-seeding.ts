import { prisma } from "@/lib/prisma";
import { contentPages, dynamicSeed, staticSeed } from "@/lib/dashboard/site-content-seed";

let seedPromise: Promise<void> | null = null;

export function ensureSiteContentSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    for (const page of contentPages) {
      await prisma.siteContentPage.upsert({ where: { pageKey: page.pageKey }, update: {}, create: { ...page } });
    }
    for (const [pageKey, sectionKey, fieldKey, label, value, headingLevel, sortOrder] of dynamicSeed) {
      await prisma.siteDynamicContent.upsert({
        where: { kind_pageKey_sectionKey_fieldKey: { kind: "DYNAMIC", pageKey, sectionKey, fieldKey } },
        update: {},
        create: { kind: "DYNAMIC", pageKey, sectionKey, fieldKey, label, value, headingLevel: headingLevel || null, sortOrder },
      });
    }
    for (const [id, pageKey, sectionKey, fieldKey, label, value, contentType, headingLevel, imageUrl, altText, isVisible, sortOrder] of staticSeed) {
      await prisma.siteDynamicContent.upsert({
        where: { kind_pageKey_sectionKey_fieldKey: { kind: "STATIC", pageKey, sectionKey, fieldKey } },
        update: {},
        create: { id, kind: "STATIC", pageKey, sectionKey, fieldKey, label, value, contentType, headingLevel: headingLevel || null, imageUrl: imageUrl || null, altText: altText || null, isVisible, sortOrder },
      });
    }
  })().catch((error) => { seedPromise = null; throw error; });
  return seedPromise;
}
