#!/usr/bin/env bash
set -euo pipefail
APP=/home/gedeco.vn/app
NEW="$APP/releases/release-90eecba"
ARCHIVE=/tmp/deploy-release-90eecba.tar.gz
test -s "$ARCHIVE"
test ! -e "$NEW"
mkdir -p "$NEW"
tar -xzf "$ARCHIVE" -C "$NEW"
test -f "$NEW/server.js"
test -f "$NEW/node_modules/next/dist/shared/lib/constants.js"
test ! -e "$NEW/.env"
test ! -e "$NEW/.uploads"
ln -s "$NEW" "$APP/current.next"
mv -Tf "$APP/current.next" "$APP/current"
systemctl restart gedeco.service
sleep 3
test "$(systemctl is-active gedeco.service)" = active
test "$(readlink -f "$APP/current")" = "$NEW"
curl -fsS -o /dev/null -w 'HOME_HTTP=%{http_code}\n' https://gedeco.vn/
curl -fsS -o /dev/null -w 'PRODUCTS_HTTP=%{http_code}\n' https://gedeco.vn/san-pham
curl -fsS -o /dev/null -w 'NEWS_HTTP=%{http_code}\n' https://gedeco.vn/tin-tuc
if journalctl -u gedeco.service --since '-2 minutes' --no-pager | grep -Eiq 'MODULE_NOT_FOUND|EACCES|ENOENT|permission denied|quota|restart loop'; then
  echo RECENT_SERVICE_ERROR
  journalctl -u gedeco.service --since '-2 minutes' --no-pager
  exit 1
fi
echo DEPLOY_OK
echo CURRENT=$(readlink -f "$APP/current")
