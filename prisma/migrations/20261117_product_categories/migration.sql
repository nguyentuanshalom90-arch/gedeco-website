ALTER TYPE "ProductCategory" RENAME TO "ProductCategoryLegacy";

CREATE TABLE "ProductCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "nameEn" TEXT NOT NULL,
  "slugEn" TEXT NOT NULL,
  "descriptionEn" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT NOT NULL DEFAULT '',
  "imageAlt" TEXT NOT NULL DEFAULT '',
  "imageCaption" TEXT NOT NULL DEFAULT '',
  "imageAltEn" TEXT NOT NULL DEFAULT '',
  "imageCaptionEn" TEXT NOT NULL DEFAULT '',
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "metaTitleEn" TEXT,
  "metaDescriptionEn" TEXT,
  "canonicalUrl" TEXT,
  "canonicalUrlEn" TEXT,
  "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
  "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");
CREATE UNIQUE INDEX "ProductCategory_slugEn_key" ON "ProductCategory"("slugEn");

INSERT INTO "ProductCategory" ("id", "name", "slug", "nameEn", "slugEn", "sortOrder") VALUES
  ('product-category-domestic', 'Sản phẩm trong nước', 'trong-nuoc', 'Domestic products', 'domestic', 10),
  ('product-category-export', 'Sản phẩm xuất khẩu', 'xuat-khau', 'Export products', 'export', 20);

ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;
UPDATE "Product" SET "categoryId" = CASE
  WHEN "category"::text = 'EXPORT' THEN 'product-category-export'
  ELSE 'product-category-domestic'
END;
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

DROP INDEX IF EXISTS "Product_category_isPublished_sortOrder_idx";
CREATE INDEX "Product_categoryId_isPublished_sortOrder_idx" ON "Product"("categoryId", "isPublished", "sortOrder");
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" DROP COLUMN "category";
DROP TYPE "ProductCategoryLegacy";
