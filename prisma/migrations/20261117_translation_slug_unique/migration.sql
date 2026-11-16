DROP INDEX IF EXISTS "TranslationEntry_entityType_locale_slug_idx";
CREATE UNIQUE INDEX "TranslationEntry_entityType_locale_slug_key"
  ON "TranslationEntry"("entityType", "locale", "slug");
