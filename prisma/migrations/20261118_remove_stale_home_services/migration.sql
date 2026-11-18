DELETE FROM "SiteDynamicContent"
WHERE "kind" = 'STATIC'
  AND "pageKey" = 'home'
  AND "sectionKey" = 'navigation'
  AND "fieldKey" = 'services';
