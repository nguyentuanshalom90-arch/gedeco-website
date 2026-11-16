# Checklist chất lượng backend, database, frontend và SEO

Cập nhật: 2026-11-17. Trạng thái dùng bốn mức: `PASS`, `ĐANG LÀM`, `THIẾU`, `CHỜ LIVE`.

## 1. Chuỗi dữ liệu admin → database → frontend

| Hạng mục | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|
| Xác thực dashboard | Phiên ký ở server, cookie HttpOnly, route/API/server action đều kiểm tra quyền | PASS local |
| Media library | Giữ file gốc, WebP derivative, MIME thật, tên ngẫu nhiên, storage persistent, alt/caption | PASS local; CHỜ LIVE migration |
| Sản phẩm | Create/read/update/delete; nháp không lộ; nội dung và trạng thái ra frontend ngay | PASS local |
| Media sản phẩm | Mọi vị trí có `Chọn từ thư viện` và `Tải ảnh lên`; ảnh chính/album có alt/caption | PASS local |
| SEO sản phẩm | Title, description, canonical, robots, OG image, hreflang, Product/Breadcrumb JSON-LD | PASS local |
| Danh mục sản phẩm | CRUD database, song ngữ, SEO, thứ tự, ẩn/hiện, route frontend | PASS local; CHỜ LIVE migration |
| Bài viết | CRUD, nháp/lên lịch/xuất bản, category, tag, media alt/caption, SEO | PASS local; CHỜ LIVE migration |
| Danh mục bài viết | CRUD, SEO VI/EN, slug/canonical riêng, liên kết bài viết, xóa an toàn | PASS local; CHỜ LIVE migration |
| English bài viết | Nội dung, metadata, media alt/caption, slug và route English lấy từ TranslationEntry | PASS local |
| Page tùy biến | CRUD section bằng form trực quan; media đầy đủ; draft/publish; SEO; song ngữ | THIẾU: editor còn nhập JSON |
| Nội dung page hiện hữu | Mọi section frontend đọc database; không ghi file release khi production | THIẾU: một phần static còn ghi JSON |
| Header/footer | CRUD database, media, link, alt, song ngữ, render toàn site | ĐANG LÀM |
| Bản dịch | Có trạng thái, lỗi không ghi đè/ẩn bản tốt, cho phép sửa thủ công, slug unique theo entity + locale | PASS product/news local; còn page audit |
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
| Sitemap | Chỉ URL canonical/indexable; có sản phẩm, bài, category, page, VI–EN và lastModified thật; cập nhật động sau CRUD | PASS local |
| Hreflang | Cặp VI/EN hai chiều và x-default; canonical cùng ngôn ngữ | PASS sản phẩm/news/static; thiếu page audit toàn bộ |
| Metadata | Title/description riêng từng URL; robots; OG/Twitter; không trùng hàng loạt | ĐANG LÀM |
| Structured data | Organization, Breadcrumb, Article, Product hợp lệ và khớp nội dung nhìn thấy | PASS product/news local; còn audit page toàn site |
| Hình ảnh | Ảnh chất lượng gần nội dung liên quan; alt mô tả; caption; WebP derivative; width/height khi phù hợp | PASS product/news local; còn audit page toàn site |
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

### Bằng chứng audit module tin tức ngày 2026-11-17

- Build production local PASS; TypeScript và Prisma validate PASS.
- QA tạm đã chứng minh English listing/detail/category đọc đúng `TranslationEntry` và trường English của `NewsCategory`; không fallback nội dung tiếng Việt.
- Canonical, hreflang VI/EN/x-default, Article + Breadcrumb JSON-LD, alt/caption và sitemap động đều được kiểm tra trên HTTP 200.
- Screenshot Chrome desktop/mobile PASS cho article English và admin category. Sidebar admin mobile được thu gọn mặc định để nội dung tác vụ xuất hiện trước; dữ liệu QA đã được xóa sau kiểm tra.

### Bằng chứng audit danh mục sản phẩm ngày 2026-11-17

- Đã thay enum danh mục cố định bằng bảng `ProductCategory` có quan hệ khóa ngoại, slug VI/EN unique, nội dung, media alt/caption VI/EN, metadata, canonical, robots, trạng thái và thứ tự.
- Luồng QA thật từ dashboard đã tạo danh mục song ngữ, tạo sản phẩm gắn danh mục, đọc lại qua API/database và hiển thị landing page VI/EN; dữ liệu QA được xóa sau kiểm tra.
- Canonical tuyệt đối, hreflang `vi/en/x-default`, CollectionPage + Breadcrumb JSON-LD và sitemap động đã được kiểm tra. Trang sản phẩm English trả 404 khi dịch thất bại, không lộ nội dung Việt.
- Build production local, TypeScript, Prisma validate và `git diff --check` PASS. Screenshot Chrome desktop/mobile PASS; sản phẩm thiếu ảnh dùng placeholder có nhãn thay vì ảnh hỏng.

## 4. Điều kiện trước production

- Commit + push; đối chiếu local/staging/live và cấu hình đúng `gedeco.vn`.
- Backup PostgreSQL live và toàn bộ persistent uploads, lưu checksum.
- Migration chỉ additive/an toàn; không restore database local lên live.
- Build release mới trước cutover; giữ `.env.production` và uploads ngoài release.
- Hậu kiểm service/log, route/API/media, canonical HTTP/HTTPS apex/www, sitemap/robots và screenshot live.
