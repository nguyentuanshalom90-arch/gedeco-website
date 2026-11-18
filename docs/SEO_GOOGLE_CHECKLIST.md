# Checklist SEO Google — GEDECO

Cập nhật: 17/11/2026. Checklist này dùng làm tiêu chuẩn nghiệm thu cho local, staging và production; trạng thái `PASS local` không thay thế hậu kiểm production/Search Console.

## Nguồn chuẩn chính thức

- [Google Search Essentials và SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [SEO Guide for Web Developers](https://developers.google.com/search/docs/fundamentals/get-started-developers)
- [Canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Localized versions và hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google Image SEO](https://developers.google.com/search/docs/appearance/google-images)
- [Core Web Vitals](https://web.dev/articles/vitals)

## 1. Crawl, index và HTTP

- [x] `robots.txt` cho phép crawl public, chặn `/dashboard` và `/api/`, khai báo sitemap. `PASS local`.
- [x] Sitemap chỉ chứa URL canonical, page public/indexable và dữ liệu đã xuất bản. Bản dịch entity chỉ xuất khi `TranslationEntry.status=TRANSLATED`. `PASS source`.
- [x] Page không tồn tại trả 404; page không được index trả `robots noindex`. `PASS local`.
- [x] Login `/vmg-login` có `noindex, nofollow`. `PASS source`.
- [x] Alias cũ dùng permanent redirect; không giữ component/page trùng lặp trong source. `PASS source`.
- [ ] Hậu kiểm production tất cả biến thể HTTP/HTTPS và apex/www redirect một bước về `https://gedeco.vn/`. `PENDING DEPLOY AUDIT`.
- [ ] Kiểm tra Googlebot truy cập được CSS, JavaScript, ảnh và route media production. `PENDING DEPLOY AUDIT`.

## 2. Canonical và song ngữ

- [x] Mỗi page indexable có self-referencing canonical trong HTML server-rendered. `PASS các route chính local`.
- [x] Cặp VI/EN khai báo `hreflang` cho chính nó, bản còn lại và `x-default` về bản Việt. `PASS các route chính local`.
- [x] Canonical của bản English trỏ tới URL English, không trỏ chéo sang bản Việt. `PASS local`.
- [x] Chỉ xuất URL English khi bản dịch entity hợp lệ; bản dịch lỗi/chưa duyệt không vào sitemap và public listing. `PASS source`.
- [x] Language switcher bài viết/danh mục dùng slug bản dịch thực tế; khi bản dịch FAILED/chưa có thì English bị vô hiệu hóa, không tạo link 404. `PASS local regression`.
- [x] Language switcher và hreflang sản phẩm dùng slug English thực tế từ database; bản FAILED/chưa duyệt không tạo alternate hoặc public URL. `PASS local regression`.
- [x] Canonical do admin lưu dạng relative được chuẩn hóa thành HTTPS absolute URL trước metadata, Open Graph, JSON-LD và link chia sẻ. `PASS source/local`.
- [x] `<html lang="vi">` và `<html lang="en">` đúng route. `PASS local`.
- [ ] Quét toàn sitemap production để xác nhận mọi alternate trả 200, reciprocal và không có URL demo/localhost. `PENDING DEPLOY AUDIT`.

## 3. Title, snippet và nội dung

- [x] Admin cho chỉnh `metaTitle`, `metaDescription`, canonical, robots ở page/product/category/news. `PASS source`.
- [x] Title và description được render server-side; mỗi template có fallback rõ ràng. `PASS các route chính local`.
- [x] Mỗi trang chính có một H1 mô tả đúng chủ đề; heading còn lại phục vụ cấu trúc nội dung và accessibility. `PASS các route chính local`.
- [x] Không dùng `meta keywords`; Google không dùng trường này làm tín hiệu. `PASS`.
- [x] Không đặt mục tiêu số từ máy móc hoặc keyword stuffing; ưu tiên nội dung hữu ích, riêng biệt, đúng ngữ cảnh. `RULE`.
- [ ] Biên tập viên rà tính chính xác, nguồn, ngày cập nhật và giá trị thực tế của từng bài trước khi publish. `EDITORIAL GATE`.

## 4. Ảnh và media

- [x] Mọi nơi chèn media trong admin có `Chọn từ thư viện` và `Tải ảnh lên`; upload đăng ký vào thư viện. `PASS source`.
- [x] Product, category, news, page body, header/footer có alt và caption; dữ liệu English tách theo locale. `PASS source/local QA`.
- [x] Frontend dùng alt mô tả, caption gần ảnh hoặc metadata trợ năng phù hợp với loại media. `PASS các module đã nối CMS`.
- [x] File gốc được giữ; frontend ưu tiên WebP derivative, không đổi đuôi/ghi đè file gốc. `PASS kiến trúc hiện tại`.
- [x] Regression upload PNG/JPG/WebP, alpha, MIME giả, derivative 0 byte, ENOENT, EACCES và hết dung lượng/quota (`ENOSPC`/`EDQUOT`); dữ liệu QA được dọn trong `finally`. `PASS npm run test:media`.
- [ ] Production media phải nằm trong persistent storage, route media trả 200 và không chứa host demo/localhost. `PENDING DEPLOY AUDIT`.

## 5. Structured data

- [x] Organization toàn site; WebSite trang chủ; WebPage/ContactPage/AboutPage/CollectionPage theo template. `PASS source`.
- [x] Product và Article có schema riêng; breadcrumb dùng URL canonical. `PASS source`.
- [x] JSON-LD được server-render và escape ký tự `<`. `PASS source`.
- [ ] Chạy Rich Results Test/Schema validator trên URL production sau deploy; required properties và ảnh phải crawlable. `PENDING DEPLOY AUDIT`.
- [ ] Không tạo review/rating giả hoặc structured data không nhìn thấy/không khớp nội dung trang. `RULE`.

## 6. Core Web Vitals, mobile và accessibility

- [ ] LCP ≤ 2,5 giây ở percentile 75; đo riêng mobile/desktop bằng dữ liệu thực tế. `PENDING FIELD DATA`.
- [ ] INP ≤ 200 ms ở percentile 75. `PENDING FIELD DATA`.
- [ ] CLS ≤ 0,1 ở percentile 75. `PENDING FIELD DATA`.
- [x] Responsive không tràn ngang ở các breakpoint đã audit; menu, form, card và CTA dùng được bằng mobile. `PASS các màn đã audit`.
- [x] Skip link, `lang`, alt, label form, button/link name và focus semantics được duy trì. `PASS các route chính`.
- [ ] Lighthouse/PageSpeed audit production cho template Home, Listing, Product Detail, Article, Contact; lưu kết quả trước/sau. `PENDING DEPLOY AUDIT`.

## 7. URL, internal link và content lifecycle

- [x] URL mô tả, slug ổn định, không dùng ID ngẫu nhiên trên public route. `PASS source`.
- [x] Header/footer chỉ liên kết canonical; route/page ngoài menu đã bị loại theo phạm vi dự án. `PASS source`.
- [x] Menu, footer, CTA, hotline, hỗ trợ sản phẩm và nút liên hệ nổi đọc dữ liệu VI/EN đã duyệt từ database; ẩn bản ghi trong dashboard loại nội dung khỏi API/frontend thay vì dựng lại fallback. `PASS npm run test:chrome`.
- [x] URL dùng chung từ dashboard chỉ nhận internal path, `tel:`, `mailto:` hoặc HTTPS an toàn; media chỉ nhận thư viện nội bộ/domain chính thức. `PASS source`.
- [x] Category, product và article detail có breadcrumb/internal link trở lại listing. `PASS source`.
- [x] Slug danh mục tin tức legacy đã được chuẩn hóa bằng migration giữ nguyên ID/quan hệ; 6 URL lỗi cũ redirect 308 sang URL chuẩn và sitemap dùng slug mới. `PASS local regression`.
- [x] Đổi slug bài viết, sản phẩm hoặc danh mục sản phẩm tạo redirect 308; đổi slug danh mục cập nhật cả URL chi tiết sản phẩm trong danh mục. `PASS source/local regression`.
- [x] HTML sản phẩm VI/EN được làm sạch theo allowlist khi ghi và khi render; chặn script, event handler, URL JavaScript và ảnh ngoài media/domain chính thức. `PASS npm run test:products`.
- [x] Regression local quét sitemap 83 URL, kiểm tra HTTP 200, `html lang`, canonical official, robots/sitemap hostname và route cũ `/doi-tac`, `/du-an`, `/en/gioi-thieu`, `/tin-tuc/chi-tiet`. `PASS npm run test:seo`; production vẫn cần crawl định kỳ.
- [x] Regression source-compliance quét `app`, `lib`, `prisma`, `public`, chặn chuỗi nội bộ không được phép và xác nhận route thừa không quay lại source. `PASS npm run test:seo`.

## 8. Search Console và vận hành production

- [ ] Xác minh domain property `gedeco.vn`, submit sitemap và kiểm tra Page Indexing/Crawl Stats. `REQUIRES SEARCH CONSOLE ACCESS`.
- [ ] Dùng URL Inspection cho Home, Product, Article, English page và media tiêu biểu. `REQUIRES SEARCH CONSOLE ACCESS`.
- [ ] Theo dõi Core Web Vitals, Enhancements, Manual Actions và Security Issues. `REQUIRES SEARCH CONSOLE ACCESS`.
- [ ] Sau mỗi deploy: quét HTTP status, canonical, hreflang, JSON-LD, sitemap, robots, ảnh và hostname ngoài allowlist. `DEPLOY GATE`.

## 9. Production configuration gate

- [x] `npm run verify:production` fail-closed nếu thiếu/sai official domain, `MEDIA_ROOT` nằm trong release, database trỏ local hoặc session secret yếu. `PASS source`; chỉ chạy với secrets production được inject từ môi trường persistent.

## Ghi chú Google quan trọng

- Google không đảm bảo xếp hạng hoặc rich result chỉ vì checklist kỹ thuật đạt.
- E-E-A-T không phải một ranking factor đơn lẻ; vẫn cần nội dung đáng tin cậy, hữu ích và people-first.
- Redirect, canonical và sitemap là các tín hiệu canonical hóa có độ mạnh khác nhau; phải nhất quán, không khai báo mâu thuẫn.
