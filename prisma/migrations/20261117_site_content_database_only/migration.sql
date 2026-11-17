CREATE TYPE "SiteContentKind" AS ENUM ('DYNAMIC', 'STATIC');

ALTER TABLE "SiteDynamicContent" ADD COLUMN "kind" "SiteContentKind" NOT NULL DEFAULT 'DYNAMIC';
ALTER TABLE "SiteDynamicContent" ADD COLUMN "imageCaption" TEXT;

DROP INDEX IF EXISTS "SiteDynamicContent_pageKey_sectionKey_fieldKey_key";
DROP INDEX IF EXISTS "SiteDynamicContent_pageKey_sortOrder_idx";
CREATE UNIQUE INDEX "SiteDynamicContent_kind_pageKey_sectionKey_fieldKey_key" ON "SiteDynamicContent"("kind", "pageKey", "sectionKey", "fieldKey");
CREATE INDEX "SiteDynamicContent_kind_pageKey_sortOrder_idx" ON "SiteDynamicContent"("kind", "pageKey", "sortOrder");
