# Runbook deploy GEDECO

Tài liệu này áp dụng cho production duy nhất: `https://gedeco.vn/`. Không deploy lên domain demo/staging và không dùng database local để ghi đè database live.

## 1. Preflight bắt buộc

- [ ] Branch đã commit và push; commit release khớp remote.
- [ ] Chạy `npm ci`, `npm run prisma:generate`, `npm run build`.
- [ ] Chạy toàn bộ regression: `test:media`, `test:news`, `test:products`, `test:chrome`, `test:seo`, `test:dashboard`, `test:dashboard-actions`.
- [ ] Chạy `npm run verify:production` bằng secrets production được inject từ secret manager/persistent env.
- [ ] Đối chiếu domain, brand, logo, database, `SITE_URL` và `MEDIA_ROOT`; gate phải PASS trước khi tạo release.
- [ ] Kiểm tra dung lượng disk, quota và inode cho source, build, backup và rollback.

## 2. Backup và đối chiếu dữ liệu live

- [ ] Backup database live và ghi checksum; kiểm tra backup có thể đọc/restore thử ở môi trường cô lập.
- [ ] Backup toàn bộ persistent uploads/media live và ghi checksum.
- [ ] Ghi nhận số bản ghi và thời điểm cập nhật của sản phẩm, danh mục, bài viết, SiteContent, SiteChrome và media.
- [ ] Nếu cần đưa dữ liệu từ local lên live, chỉ export/import chọn lọc hoặc upsert theo ID/slug/key; tuyệt đối không restore full database local lên live.
- [ ] Không thay thế volume uploads/media live bằng thư mục local.

## 3. Release và persistent storage

- [ ] Build release thành công trước khi chuyển traffic.
- [ ] `MEDIA_ROOT` là đường dẫn tuyệt đối ngoài release; không copy `.env.production` vào release.
- [ ] Kiểm tra symlink/volume `/uploads` hoặc route media trỏ đúng persistent storage và có containment check.
- [ ] Không dùng symlink `release/node_modules -> current/node_modules`.
- [ ] Chuyển `current` bằng thao tác atomic, giữ release rollback đã biết tốt.

## 4. Hậu kiểm sau chuyển traffic

- [ ] Service active, log mới không có `MODULE_NOT_FOUND`, `EACCES`, `ENOENT`, quota hoặc restart loop.
- [ ] HTTP 200 cho `/`, `/san-pham`, một product detail, `/tin-tuc`, một article và `/lien-he`.
- [ ] Kiểm tra favicon, logo, ảnh sản phẩm, ảnh upload persistent và route `/api/media/:id`.
- [ ] Chạy upload healthcheck tạm, xác nhận original + WebP derivative + database metadata, sau đó xóa đúng asset test.
- [ ] Quét HTML/JSON-LD/sitemap/feed không có localhost, demo host, HTTP media hoặc hostname ngoài allowlist.
- [ ] Kiểm tra HTTP/HTTPS và apex/www đều canonical về `https://gedeco.vn/`.
- [ ] Kiểm tra dashboard login, logout, các tab CRUD và chỉnh alt/caption media.

Nếu bất kỳ bước backup, persistent media, service hoặc HTTP hậu kiểm nào chưa xác minh được thì chưa được báo deploy thành công.
