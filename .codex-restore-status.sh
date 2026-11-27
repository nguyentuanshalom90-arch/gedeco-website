set -euo pipefail
. /home/gedeco.vn/shared/.env.production
PGURL="${DATABASE_URL%%\?*}"
psql "$PGURL" -v ON_ERROR_STOP=1 <<'SQL'
UPDATE "Product"
SET "isPublished" = TRUE
WHERE "slug" = 'tra-dinh-thuong-hang-uop-sen'
RETURNING "id", "slug", "isPublished";
SQL
