-- Convert legacy homepage image URL values into first-class CMS media fields.
UPDATE "SiteDynamicContent"
SET
  "contentType" = 'IMAGE',
  "imageUrl" = COALESCE(NULLIF("imageUrl", ''), NULLIF("value", '')),
  "value" = '',
  "altText" = COALESCE(NULLIF("altText", ''), CASE
    WHEN "sectionKey" = 'hero' AND "fieldKey" = 'banner1' THEN 'Hoạt động thương mại toàn cầu của GEDECO'
    WHEN "sectionKey" = 'hero' AND "fieldKey" = 'banner2' THEN 'Sản phẩm và thị trường của GEDECO'
    WHEN "sectionKey" = 'projects.1' THEN 'Phát triển nguồn hàng nông sản'
    WHEN "sectionKey" = 'projects.2' THEN 'Hợp tác sản phẩm trà'
    WHEN "sectionKey" = 'projects.3' THEN 'Kết nối xuất khẩu'
    ELSE NULL
  END)
WHERE "kind" = 'DYNAMIC'
  AND "pageKey" = 'home'
  AND (
    ("sectionKey" = 'hero' AND "fieldKey" IN ('banner1', 'banner2'))
    OR ("sectionKey" IN ('projects.1', 'projects.2', 'projects.3') AND "fieldKey" = 'image')
  );
