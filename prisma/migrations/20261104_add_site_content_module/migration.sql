CREATE TABLE "SiteContentPage" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "h1" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteContentPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteDynamicContent" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "contentType" TEXT NOT NULL DEFAULT 'TEXT',
    "headingLevel" TEXT,
    "imageUrl" TEXT,
    "altText" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteDynamicContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteContentPage_pageKey_key" ON "SiteContentPage"("pageKey");
CREATE INDEX "SiteContentPage_route_idx" ON "SiteContentPage"("route");
CREATE UNIQUE INDEX "SiteDynamicContent_pageKey_sectionKey_fieldKey_key" ON "SiteDynamicContent"("pageKey", "sectionKey", "fieldKey");
CREATE INDEX "SiteDynamicContent_pageKey_sortOrder_idx" ON "SiteDynamicContent"("pageKey", "sortOrder");
ALTER TABLE "SiteDynamicContent" ADD CONSTRAINT "SiteDynamicContent_pageKey_fkey" FOREIGN KEY ("pageKey") REFERENCES "SiteContentPage"("pageKey") ON DELETE CASCADE ON UPDATE CASCADE;
