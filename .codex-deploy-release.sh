set -euo pipefail
ARCHIVE=/home/vpsadmin/release-9e79119.tar.gz
APP=/home/gedeco.vn/app
RELEASE=$APP/releases/9e79119-20261123T163000Z
CURRENT=$APP/current
test -s "$ARCHIVE"
mkdir -p "$RELEASE"
tar -xzf "$ARCHIVE" -C "$RELEASE"
test -f "$RELEASE/server.js"
test -f "$RELEASE/.next/BUILD_ID"
test ! -e "$RELEASE/.uploads"
chown -R gedeco1234:gedeco1234 "$RELEASE"
ln -s "$RELEASE" "$APP/current.next"
mv -Tf "$APP/current.next" "$CURRENT"
systemctl restart gedeco.service
sleep 3
systemctl is-active --quiet gedeco.service
curl -fsS -o /dev/null -w 'LOCAL_HTTP=%{http_code}\n' http://127.0.0.1:3010/
echo RELEASE="$RELEASE"
readlink -f "$CURRENT"
rm -f "$ARCHIVE"
