# Checklist chất lượng backend, database, frontend và SEO

Cập nhật: 2026-11-16. Trạng thái dùng bốn mức: `PASS`, `ĐANG LÀM`, `THIẾU`, `CHỜ LIVE`.

## 1. Chuỗi dữ liệu admin → database → frontend

| Hạng mục | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|
| Xác thực dashboard | Phiên ký ở server, cookie HttpOnly, route/API/server action đều kiểm tra quyền | PASS local |
| Media library | Giữ file gốc, WebP derivative, MIME thật, tên ngẫu nhiên, storage persistent, alt/caption | PASS local; CHỜ LIVE migration |
| Sản phẩm | Create/read/update/delete; nháp không lộ; nội dung và trạng thái ra frontend ngay | ĐANG LÀM |
| Media sản phẩm | Mọi vị trí có `Chọn từ thư viện` và `Tải ảnh lên`; ảnh chính/album có alt/caption | PASS local |
| SEO sản phẩm | Title, description, canonical, robots, OG image, hreflang, Product/Breadcrumb JSON-LD | PASS local |
| Danh mục sản phẩm | CRUD database, song ngữ, SEO, thứ tự, ẩn/hiện, route frontend | THIẾU |
| Bài viết | CRUD, nháp/lên lịch/xuất bản, category, tag, media, SEO | ĐANG LÀM |
| Danh mục bài viết | CRUD, SEO, liên kết bài viết, xóa an toàn | ĐANG LÀM |
| English bài viết | Nội dung, metadata, slug và route English lấy từ TranslationEntry | THIẾU: route detail đang tái dùng renderer VI |
| Page tùy biến | CRUD section bằng form trực quan; media đầy đủ; draft/publish; SEO; song ngữ | THIẾU: editor còn nhập JSON |
| Nội dung page hiện hữu | Mọi section frontend đọc database; không ghi file release khi production | THIẾU: một phần static còn ghi JSON |
| Header/footer | CRUD database, media, link, alt, song ngữ, render toàn site | ĐANG LÀM |
| Bản dịch | Có trạng thái, lỗi không ghi đè bản tốt, cho phép sửa thủ công, slug unique theo locale | ĐANG LÀM |
| Toàn vẹn giao dịch | Ghi entity và quan hệ media trong transaction; unique/foreign key/validation | PASS sản phẩm; cần rà các module còn lại |
| Kiểm thử hồi quy | CRUD + render + upload lỗi MIME/EACCES/ENOENT/quota/0 byte + song ngữ | THIẾU |

## 2. SEO theo Google Search Central

Nguồn chuẩn:

- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Search Essentials](https://developers.google.com/search/docs/essentials)
- [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Localized versions và hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Image SEO](https://developers.google.com/search/docs/appearance/google-images)
- [Structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)

| Nhóm | Tiêu chí | Trạng thái |
|---|---|---|
| Crawl/index | HTTP 200 đúng trang; 404 thật; draft/noindex; robots không chặn tài nguyên render | ĐANG LÀM |
| Canonical | Self-canonical tuyệt đối/không mâu thuẫn; HTTP/www về HTTPS apex | PASS cấu hình; CHỜ LIVE regression |
| Sitemap | Chỉ URL canonical/indexable; có sản phẩm, bài, page, VI–EN và lastModified thật | PASS local |
| Hreflang | Cặp VI/EN hai chiều và x-default; canonical cùng ngôn ngữ | PASS sản phẩm/static; thiếu news/page audit |
| Metadata | Title/description riêng từng URL; robots; OG/Twitter; không trùng hàng loạt | ĐANG LÀM |
| Structured data | Organization, Breadcrumb, Article, Product hợp lệ và khớp nội dung nhìn thấy | ĐANG LÀM |
| Hình ảnh | Ảnh chất lượng gần nội dung liên quan; alt mô tả; WebP derivative; width/height khi phù hợp | ĐANG LÀM |
| Nội dung | Hữu ích, nguyên bản, cập nhật, heading rõ; không keyword stuffing/meta keywords | ĐANG LÀM |
| Internal links | Link crawl được, anchor mô tả, không orphan page, breadcrumb nhất quán | THIẾU audit toàn site |
| Core Web Vitals | LCP ≤ 2,5 giây; INP < 200 ms; CLS < 0,1 ở percentile 75 | THIẾU đo field data/Search Console |
| Mobile/a11y | Responsive, không overflow, keyboard/focus, tên truy cập, contrast/heading hợp lý | ĐANG LÀM |
| Search Console | Property, sitemap, index coverage, enhancement, CWV, manual actions | CHỜ quyền truy cập live |

## 3. Admin UI/UX

- Giữ concept màu sắc/bố cục hiện tại, nhưng ưu tiên tác vụ chính và trạng thái rõ ràng.
- Danh sách có tìm kiếm, bộ lọc, trạng thái, empty/loading/error và hành động nhất quán.
- Form chia nhóm: Nội dung → Media → SEO → Xuất bản; sticky action hoặc nút lưu dễ thấy.
- Hiện validation cạnh trường; không báo thành công khi backend lỗi.
- Media picker dùng chung, luôn có hai lựa chọn bắt buộc và mang theo alt/caption.
- Không bắt người dùng chỉnh JSON/HTML thô ở các luồng nội dung thông thường.
- Có preview URL, metadata và trạng thái bản dịch trước khi xuất bản.
- Audit screenshot desktop, tablet và mobile trước khi đóng mỗi module frontend.

## 4. Điều kiện trước production

- Commit + push; đối chiếu local/staging/live và cấu hình đúng `gedeco.vn`.
- Backup PostgreSQL live và toàn bộ persistent uploads, lưu checksum.
- Migration chỉ additive/an toàn; không restore database local lên live.
- Build release mới trước cutover; giữ `.env.production` và uploads ngoài release.
- Hậu kiểm service/log, route/API/media, canonical HTTP/HTTPS apex/www, sitemap/robots và screenshot live.
