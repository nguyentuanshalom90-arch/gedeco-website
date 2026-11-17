-- Remove CMS records for pages intentionally removed from the public site.
DELETE FROM "TranslationEntry"
WHERE "entityType" = 'SITE_CONTENT'
  AND "entityId" IN (
    SELECT "id" FROM "SiteDynamicContent"
    WHERE "pageKey" IN ('doi-tac', 'du-an')
       OR ("kind" = 'STATIC' AND "pageKey" = 'home' AND "sectionKey" = 'navigation' AND "fieldKey" = 'partners')
  );

DELETE FROM "SiteDynamicContent"
WHERE "pageKey" IN ('doi-tac', 'du-an')
   OR ("kind" = 'STATIC' AND "pageKey" = 'home' AND "sectionKey" = 'navigation' AND "fieldKey" = 'partners');

DELETE FROM "SiteContentPage" WHERE "pageKey" IN ('doi-tac', 'du-an');

DELETE FROM "TranslationEntry"
WHERE "entityType" = 'SITE_CHROME'
  AND "entityId" IN (
    SELECT "id" FROM "SiteChromeContent"
    WHERE "area" = 'HEADER' AND "sectionKey" = 'navigation' AND "fieldKey" IN ('partners', 'projects')
  );

DELETE FROM "SiteChromeContent"
WHERE "area" = 'HEADER' AND "sectionKey" = 'navigation' AND "fieldKey" IN ('partners', 'projects');
