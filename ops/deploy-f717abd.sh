#!/usr/bin/env bash
set -euo pipefail
APP=/home/gedeco.vn/app
NEW="$APP/releases/release-f717abd2"
test -s /tmp/release-f717abd2-source.tar
test -s /tmp/release-f717abd2-next.tar
test ! -e "$NEW"
mkdir -p "$NEW"
tar -xf /tmp/release-f717abd2-source.tar -C "$NEW"
tar -xf /tmp/release-f717abd2-next.tar -C "$NEW"
cp -a "$NEW/.next/standalone/." "$NEW/"
cp -a "$APP/current/node_modules" "$NEW/node_modules"
rm -f "$NEW/.env"
rm -rf "$NEW/.uploads"
test -f "$NEW/server.js"
test -f "$NEW/node_modules/next/dist/shared/lib/constants.js"
test ! -e "$NEW/.env"
test ! -e "$NEW/.uploads"
ln -s "$NEW" "$APP/current.next"
mv -Tf "$APP/current.next" "$APP/current"
systemctl restart gedeco.service
sleep 4
test "$(systemctl is-active gedeco.service)" = active
test "$(readlink -f "$APP/current")" = "$NEW"
curl -fsS -o /dev/null -w 'HOME_HTTP=%{http_code}\n' https://gedeco.vn/
curl -fsS -o /dev/null -w 'PRODUCTS_HTTP=%{http_code}\n' https://gedeco.vn/san-pham
curl -fsS -o /dev/null -w 'NEWS_HTTP=%{http_code}\n' https://gedeco.vn/tin-tuc
if journalctl -u gedeco.service --since '-2 minutes' --no-pager | grep -Eiq 'MODULE_NOT_FOUND|EACCES|ENOENT|permission denied|quota|restart loop'; then exit 1; fi
echo DEPLOY_OK
echo CURRENT=$(readlink -f "$APP/current")
