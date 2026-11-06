-- CreateEnum
CREATE TYPE "SiteChromeArea" AS ENUM ('HEADER', 'FOOTER');

-- CreateEnum
CREATE TYPE "SiteChromeKind" AS ENUM ('DYNAMIC', 'STATIC');

-- CreateTable
CREATE TABLE "SiteChromeContent" (
    "id" TEXT NOT NULL,
    "area" "SiteChromeArea" NOT NULL,
    "kind" "SiteChromeKind" NOT NULL DEFAULT 'DYNAMIC',
    "sectionKey" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "url" TEXT,
    "imageUrl" TEXT,
    "altText" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteChromeContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteChromeContent_area_sectionKey_fieldKey_key" ON "SiteChromeContent"("area", "sectionKey", "fieldKey");

-- CreateIndex
CREATE INDEX "SiteChromeContent_area_kind_sortOrder_idx" ON "SiteChromeContent"("area", "kind", "sortOrder");
