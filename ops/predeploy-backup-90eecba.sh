#!/usr/bin/env bash
set -euo pipefail
B=/home/gedeco.vn/shared/backups/predeploy-20261128-90eecba
mkdir -p "$B"
cp -a /home/gedeco.vn/shared/.env.production "$B/.env.production"
tar -czf "$B/uploads.tar.gz" -C /home/gedeco.vn/shared uploads
set -a
. /home/gedeco.vn/shared/.env.production
set +a
PG_URL="$(printf '%s' "$DATABASE_URL" | sed -E 's/([?&])schema=[^&]*&?//; s/[?&]$//')"
pg_dump "$PG_URL" > "$B/database.sql"
sha256sum "$B/database.sql" "$B/uploads.tar.gz" "$B/.env.production"
echo BACKUP_OK
