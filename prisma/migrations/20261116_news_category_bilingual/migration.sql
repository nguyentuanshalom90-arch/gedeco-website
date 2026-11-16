ALTER TABLE "NewsCategory"
  ADD COLUMN "nameEn" TEXT,
  ADD COLUMN "slugEn" TEXT,
  ADD COLUMN "descriptionEn" TEXT,
  ADD COLUMN "metaTitleEn" TEXT,
  ADD COLUMN "metaDescriptionEn" TEXT,
  ADD COLUMN "canonicalUrlEn" TEXT;

CREATE UNIQUE INDEX "NewsCategory_slugEn_key" ON "NewsCategory"("slugEn");
