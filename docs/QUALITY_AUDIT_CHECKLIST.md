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
| Page tùy biến | CRUD section bằng form trực quan; media đầy đủ; draft/publish; SEO; song ngữ | PASS local; CHỜ provider/live migration |
| Nội dung page hiện hữu | Mọi section frontend đọc database; không ghi file release khi production | ĐANG LÀM: Giới thiệu và Liên hệ VI/EN đã nối đầy đủ; còn Trang chủ |
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
| Hreflang | Cặp VI/EN hai chiều và x-default; canonical cùng ngôn ngữ | PASS sản phẩm/news/page tùy biến/static local |
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

### Bằng chứng audit page builder ngày 2026-11-17

- Đã loại bỏ ô nhập JSON; admin có builder trực quan cho Hero, Nội dung, Lưới điểm nổi bật và CTA, hỗ trợ thêm/xóa/sắp xếp section và item.
- Hero media có đủ `Chọn từ thư viện` và `Tải ảnh lên`, alt/caption; page có tìm kiếm, sửa, xóa kèm translation, preview SEO, canonical, robots và draft/publish.
- QA thật đã tạo page qua dashboard, ghi PostgreSQL, render frontend rồi xóa sạch. English lỗi trả 404 và không xuất hiện sitemap; VI có canonical, hreflang phù hợp, WebPage + Breadcrumb JSON-LD.
- Renderer public được hoàn thiện responsive; screenshot admin, frontend desktop/mobile PASS. Build production local, TypeScript, Prisma validate và `git diff --check` PASS.

### Bằng chứng audit content storage database-only ngày 2026-11-17

- Đã hợp nhất nội dung `DYNAMIC/STATIC` vào PostgreSQL bằng enum và unique key có loại; xóa hoàn toàn cơ chế đọc/ghi `data/site-static-content.json` trong runtime.
- Seed idempotent giữ nguyên 12 ID static cũ để bảo toàn quan hệ translation; 30 bản ghi dynamic hiện hữu được giữ nguyên. Frontend/API chỉ đọc database.
- Media content dùng picker chung với đủ thư viện/tải lên, alt/caption; caption được đưa vào payload dịch. Xóa content xóa translation liên quan trong transaction.
- QA qua giao diện thật đã tạo content nền, API đọc đúng từ PostgreSQL rồi dữ liệu/translation QA được xóa. Screenshot admin PASS; TypeScript, Prisma, build và `git diff --check` PASS.

### Bằng chứng audit trang Giới thiệu database-backed ngày 2026-11-17

- Toàn bộ hero, phần giới thiệu, nhóm giá trị, năng lực và CTA của `/gioi-thieu` đọc từ `SiteDynamicContent`; media lấy URL, alt và caption từ cùng bản ghi CMS.
- Seed idempotent local có 33 trường cho trang Giới thiệu, gồm ba vị trí media. QA sửa tiêu đề qua dashboard đã xuất hiện ngay trên frontend và được khôi phục sạch; không còn translation QA.
- `/gioi-thieu` và `/en/about` đều trả HTTP 200; bản English dùng translation khi có và fallback English an toàn khi provider chưa dịch, không lộ nội dung Việt.
- Canonical, hreflang `vi/en/x-default`, robots, Open Graph, AboutPage + Breadcrumb JSON-LD và asset media HTTP 200 đã được kiểm tra.
- Screenshot Chrome desktop/mobile PASS; mobile 390px có `scrollWidth = innerWidth = 390`, không có phần tử vượt viewport. TypeScript, Prisma validate, build production local và `git diff --check` PASS.

### Phạm vi page và header/footer ngày 2026-11-17

- Phạm vi page nội dung chỉ gồm các mục thực sự xuất hiện trong header/footer: Trang chủ, Giới thiệu, Tin tức, Sản phẩm và Liên hệ.
- Đã xóa hoàn toàn route Đối tác/Dự án và các alias VI/EN khỏi source, CMS tabs, seed, sitemap và language map; sáu URL cũ đều trả 404 local.
- Đã loại liên kết homepage tới các route vừa xóa để không phát sinh broken link. Khối dự án nổi bật trên homepage vẫn là một section nội dung, không còn dẫn tới page riêng.
- API header/footer đã hỗ trợ `lang=en`, chỉ trả nội dung English khi có `TranslationEntry` hợp lệ và không fallback tiếng Việt. QA translation tạm PASS rồi được xóa.
- Build route manifest giảm từ 35 xuống 29 static pages; sitemap/header API không còn Đối tác/Dự án. Screenshot homepage English mobile 390px PASS, không tràn ngang.

### Bằng chứng audit trang Liên hệ database-backed ngày 2026-11-17

- Trang Liên hệ có 67 trường CMS database-backed, gồm hero, giới thiệu, ba thẻ liên hệ, toàn bộ nhãn form, bản đồ, liên hệ nhanh, FAQ và CTA; bốn vị trí media có URL, alt và caption.
- `/en/contact` dùng wrapper English đúng thay vì vô tình render component Việt; `/en/lien-he` chuyển hướng về canonical. English fallback không lộ nội dung Việt khi chưa có bản dịch.
- QA database → frontend PASS cho nội dung Việt và `TranslationEntry` English; dữ liệu QA đã được khôi phục/xóa sạch. URL hotline/Zalo/Messenger được giới hạn ở `tel:` hợp lệ hoặc HTTPS không có userinfo.
- Metadata VI/EN có canonical, hreflang `vi/en/x-default`, robots, Open Graph alt đúng locale, ContactPage + Breadcrumb JSON-LD.
- Admin body hiển thị 67 bản ghi và bổ sung bộ lọc section để thao tác nhanh; media row hiện URL ảnh thay vì báo trống. Screenshot admin desktop, frontend VI desktop và EN mobile PASS; mobile 390px không tràn ngang.

## 4. Điều kiện trước production

- Commit + push; đối chiếu local/staging/live và cấu hình đúng `gedeco.vn`.
- Backup PostgreSQL live và toàn bộ persistent uploads, lưu checksum.
- Migration chỉ additive/an toàn; không restore database local lên live.
- Build release mới trước cutover; giữ `.env.production` và uploads ngoài release.
- Hậu kiểm service/log, route/API/media, canonical HTTP/HTTPS apex/www, sitemap/robots và screenshot live.
