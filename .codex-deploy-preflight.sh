set -euo pipefail
TS=$(date +%Y%m%d-%H%M%S)
B=/home/gedeco.vn/shared/backups/predeploy-$TS
mkdir -p "$B"
df -h /home/gedeco.vn
df -i /home/gedeco.vn
. /home/gedeco.vn/shared/.env.production
: "${DATABASE_URL:?DATABASE_URL missing}"
: "${MEDIA_ROOT:?MEDIA_ROOT missing}"
PGURL="${DATABASE_URL%%\?*}"
cp -a /home/gedeco.vn/shared/.env.production "$B/.env.production"
pg_dump "$PGURL" > "$B/database.sql"
tar -czf "$B/uploads.tar.gz" -C "$MEDIA_ROOT" .
sha256sum "$B/database.sql" "$B/uploads.tar.gz" "$B/.env.production" > "$B/SHA256SUMS"
chown -R gedeco1234:gedeco1234 "$B"
ls -lh "$B"
echo BACKUP_SUCCESS="$B"
echo MEDIA_ROOT="$MEDIA_ROOT"
