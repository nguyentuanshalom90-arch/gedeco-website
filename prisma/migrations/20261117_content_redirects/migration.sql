CREATE TABLE IF NOT EXISTS "UrlRedirect" (
  "id" TEXT NOT NULL,
  "sourcePath" TEXT NOT NULL,
  "destinationPath" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UrlRedirect_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UrlRedirect_sourcePath_key" ON "UrlRedirect"("sourcePath");
CREATE INDEX IF NOT EXISTS "UrlRedirect_destinationPath_idx" ON "UrlRedirect"("destinationPath");
