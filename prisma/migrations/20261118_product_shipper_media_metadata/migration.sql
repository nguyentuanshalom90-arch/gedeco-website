ALTER TABLE "Product" ADD COLUMN "shipperImageAlt" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "shipperImageCaption" TEXT NOT NULL DEFAULT '';

UPDATE "Product"
SET "shipperImageAlt" = CASE WHEN "shipperImageUrl" <> '' THEN 'Dịch vụ giao hàng' ELSE '' END
WHERE "shipperImageAlt" = '';
