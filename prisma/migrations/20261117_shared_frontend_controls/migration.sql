-- Add shared storefront controls without overwriting records already edited on live.
ALTER TABLE "SiteChromeContent"
ADD COLUMN IF NOT EXISTS "imageCaption" TEXT;

DELETE FROM "TranslationEntry"
WHERE "entityType" = 'SITE_CHROME' AND "entityId" IN (
  SELECT "id" FROM "SiteChromeContent" WHERE "area" = 'HEADER' AND "sectionKey" = 'navigation' AND "fieldKey" = 'services'
);
DELETE FROM "SiteChromeContent" WHERE "area" = 'HEADER' AND "sectionKey" = 'navigation' AND "fieldKey" = 'services';

INSERT INTO "SiteChromeContent" ("id", "area", "kind", "sectionKey", "fieldKey", "label", "value", "url", "imageUrl", "altText", "imageCaption", "isVisible", "sortOrder", "createdAt", "updatedAt") VALUES
('chrome-navigation-products', 'HEADER', 'STATIC', 'navigation', 'products', 'Sản phẩm', 'Sản phẩm', '/san-pham', NULL, NULL, NULL, true, 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-support-heading', 'FOOTER', 'DYNAMIC', 'shopSupport', 'heading', 'Tiêu đề hỗ trợ sản phẩm', 'HỖ TRỢ KHÁCH HÀNG', NULL, NULL, NULL, NULL, true, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-support-image', 'FOOTER', 'DYNAMIC', 'shopSupport', 'image', 'Ảnh nhân viên hỗ trợ', '', NULL, '/assets/shop-support.jpg', 'Nhân viên hỗ trợ khách hàng GEDECO', NULL, true, 41, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-support-name', 'FOOTER', 'DYNAMIC', 'shopSupport', 'name', 'Tên nhân viên hỗ trợ', 'MỸ LINH', NULL, NULL, NULL, NULL, true, 42, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-support-phone', 'FOOTER', 'DYNAMIC', 'shopSupport', 'phone', 'Số điện thoại hỗ trợ', 'SĐT: +(84) 914943653', 'tel:+84914943653', NULL, NULL, NULL, true, 43, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-news-heading', 'FOOTER', 'DYNAMIC', 'shopNews', 'heading', 'Tiêu đề tin nổi bật', 'TIN TỨC NỔI BẬT', NULL, NULL, NULL, NULL, true, 44, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-buy-label', 'FOOTER', 'DYNAMIC', 'shopBuy', 'label', 'Nhãn nút mua hàng', 'MUA HÀNG', 'tel:+84914943653', NULL, NULL, NULL, true, 45, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-buy-contact', 'FOOTER', 'DYNAMIC', 'shopBuy', 'contact', 'Nhãn liên hệ sản phẩm', 'Liên hệ về sản phẩm · 0914 94 3653', 'tel:+84914943653', NULL, NULL, NULL, true, 46, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-guarantee-heading', 'FOOTER', 'DYNAMIC', 'shopGuarantee', 'heading', 'Tiêu đề cam kết mua hàng', 'CAM KẾT KHI MUA HÀNG', NULL, NULL, NULL, NULL, true, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-guarantee-1', 'FOOTER', 'DYNAMIC', 'shopGuarantee', 'item1', 'Cam kết 1', 'Cam kết 100% hàng chính hãng chất lượng', NULL, NULL, NULL, NULL, true, 51, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-guarantee-2', 'FOOTER', 'DYNAMIC', 'shopGuarantee', 'item2', 'Cam kết 2', 'Giá cả tối ưu nhất thị trường', NULL, NULL, NULL, NULL, true, 52, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-guarantee-3', 'FOOTER', 'DYNAMIC', 'shopGuarantee', 'item3', 'Cam kết 3', 'Dịch vụ hậu mãi chu đáo', NULL, NULL, NULL, NULL, true, 53, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-shop-guarantee-4', 'FOOTER', 'DYNAMIC', 'shopGuarantee', 'item4', 'Cam kết 4', 'Mua số lượng lớn. Vui lòng liên hệ 0946548996 để được hỗ trợ giá tốt nhất.', 'tel:0946548996', NULL, NULL, NULL, true, 54, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-floating-quick', 'FOOTER', 'DYNAMIC', 'floating', 'quick', 'Nhãn nhóm liên hệ nổi', 'Liên hệ nhanh', NULL, NULL, NULL, NULL, true, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-floating-zalo', 'FOOTER', 'DYNAMIC', 'floating', 'zalo', 'Nhãn và URL Zalo', 'Chat qua Zalo', 'https://zalo.me/0914943653', '/assets/contact-icons/zalo-chat.png', 'Zalo', NULL, true, 61, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-floating-phone', 'FOOTER', 'DYNAMIC', 'floating', 'phone', 'Nhãn và URL gọi điện', 'Gọi 0914 94 3653', 'tel:0914943653', NULL, NULL, NULL, true, 62, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-floating-top', 'FOOTER', 'DYNAMIC', 'floating', 'top', 'Nhãn lên đầu trang', 'Lên đầu trang', NULL, NULL, NULL, NULL, true, 63, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-footer-label-contact', 'FOOTER', 'DYNAMIC', 'footerLabel', 'contact', 'Tiêu đề cột liên hệ', 'THÔNG TIN LIÊN HỆ', NULL, NULL, NULL, NULL, true, 22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-footer-label-quick', 'FOOTER', 'DYNAMIC', 'footerLabel', 'quick', 'Tiêu đề cột liên kết', 'LIÊN KẾT NHANH', NULL, NULL, NULL, NULL, true, 23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-footer-label-support', 'FOOTER', 'DYNAMIC', 'footerLabel', 'support', 'Tiêu đề cột hỗ trợ', 'HỖ TRỢ', NULL, NULL, NULL, NULL, true, 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-quick-about', 'FOOTER', 'DYNAMIC', 'quickLink', 'about', 'Liên kết Giới thiệu', 'Giới thiệu', '/gioi-thieu', NULL, NULL, NULL, true, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-quick-products', 'FOOTER', 'DYNAMIC', 'quickLink', 'products', 'Liên kết Sản phẩm', 'Sản phẩm', '/san-pham', NULL, NULL, NULL, true, 26, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-quick-news', 'FOOTER', 'DYNAMIC', 'quickLink', 'news', 'Liên kết Tin tức', 'Tin tức', '/tin-tuc', NULL, NULL, NULL, true, 27, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-quick-contact', 'FOOTER', 'DYNAMIC', 'quickLink', 'contact', 'Liên kết Liên hệ', 'Liên hệ', '/lien-he', NULL, NULL, NULL, true, 28, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-support-authentic', 'FOOTER', 'DYNAMIC', 'supportLink', 'authentic', 'Liên kết Chính sách chính hãng', 'Chính sách hàng chính hãng', '/chinh-sach-hang-chinh-hang', NULL, NULL, NULL, true, 31, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-support-order', 'FOOTER', 'DYNAMIC', 'supportLink', 'order', 'Liên kết Hướng dẫn mua hàng', 'Hướng dẫn mua hàng', '/huong-dan-mua-hang', NULL, NULL, NULL, true, 32, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-support-shipping', 'FOOTER', 'DYNAMIC', 'supportLink', 'shipping', 'Liên kết Giao hàng', 'Giao hàng và thanh toán', '/giao-hang-va-thanh-toan', NULL, NULL, NULL, true, 33, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-support-returns', 'FOOTER', 'DYNAMIC', 'supportLink', 'returns', 'Liên kết Đổi trả', 'Đổi trả và bảo hành', '/doi-tra-va-bao-hanh', NULL, NULL, NULL, true, 34, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chrome-legal-registration', 'FOOTER', 'DYNAMIC', 'legal', 'registration', 'Mã số doanh nghiệp', 'Mã số doanh nghiệp: 0109613491', NULL, NULL, NULL, NULL, true, 35, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("area", "sectionKey", "fieldKey") DO NOTHING;

INSERT INTO "TranslationEntry" ("id", "entityType", "entityId", "locale", "payload", "sourceUpdatedAt", "sourceHash", "status", "provider", "manualOverride", "translatedAt", "reviewedAt", "createdAt", "updatedAt") VALUES
('tr-chrome-navigation-products', 'SITE_CHROME', 'chrome-navigation-products', 'en', '{"label":"Products","value":"Products","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-support-heading', 'SITE_CHROME', 'chrome-shop-support-heading', 'en', '{"label":"Product support heading","value":"CUSTOMER SUPPORT","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-support-image', 'SITE_CHROME', 'chrome-shop-support-image', 'en', '{"label":"Support representative image","value":"","altText":"GEDECO customer support representative","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-support-name', 'SITE_CHROME', 'chrome-shop-support-name', 'en', '{"label":"Support representative name","value":"MY LINH","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-support-phone', 'SITE_CHROME', 'chrome-shop-support-phone', 'en', '{"label":"Support phone","value":"Phone: +(84) 914943653","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-news-heading', 'SITE_CHROME', 'chrome-shop-news-heading', 'en', '{"label":"Featured news heading","value":"FEATURED NEWS","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-buy-label', 'SITE_CHROME', 'chrome-shop-buy-label', 'en', '{"label":"Buy button label","value":"BUY NOW","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-buy-contact', 'SITE_CHROME', 'chrome-shop-buy-contact', 'en', '{"label":"Product contact label","value":"Contact about this product · 0914 94 3653","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-guarantee-heading', 'SITE_CHROME', 'chrome-shop-guarantee-heading', 'en', '{"label":"Purchase guarantee heading","value":"PURCHASE GUARANTEE","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-guarantee-1', 'SITE_CHROME', 'chrome-shop-guarantee-1', 'en', '{"label":"Guarantee 1","value":"100% genuine, quality products","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-guarantee-2', 'SITE_CHROME', 'chrome-shop-guarantee-2', 'en', '{"label":"Guarantee 2","value":"Best market pricing","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-guarantee-3', 'SITE_CHROME', 'chrome-shop-guarantee-3', 'en', '{"label":"Guarantee 3","value":"Thoughtful after-sales service","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-shop-guarantee-4', 'SITE_CHROME', 'chrome-shop-guarantee-4', 'en', '{"label":"Guarantee 4","value":"For bulk orders, call 0946548996 for the best price.","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-floating-quick', 'SITE_CHROME', 'chrome-floating-quick', 'en', '{"label":"Floating contact group label","value":"Quick contact","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-floating-zalo', 'SITE_CHROME', 'chrome-floating-zalo', 'en', '{"label":"Zalo label","value":"Chat on Zalo","altText":"Zalo","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-floating-phone', 'SITE_CHROME', 'chrome-floating-phone', 'en', '{"label":"Phone label","value":"Call 0914 94 3653","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-floating-top', 'SITE_CHROME', 'chrome-floating-top', 'en', '{"label":"Back to top label","value":"Back to top","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-footer-label-contact', 'SITE_CHROME', 'chrome-footer-label-contact', 'en', '{"label":"Contact column heading","value":"CONTACT","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-footer-label-quick', 'SITE_CHROME', 'chrome-footer-label-quick', 'en', '{"label":"Quick links heading","value":"QUICK LINKS","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-footer-label-support', 'SITE_CHROME', 'chrome-footer-label-support', 'en', '{"label":"Support column heading","value":"SUPPORT","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-quick-about', 'SITE_CHROME', 'chrome-quick-about', 'en', '{"label":"About link","value":"About us","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-quick-products', 'SITE_CHROME', 'chrome-quick-products', 'en', '{"label":"Products link","value":"Products","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-quick-news', 'SITE_CHROME', 'chrome-quick-news', 'en', '{"label":"News link","value":"News","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-quick-contact', 'SITE_CHROME', 'chrome-quick-contact', 'en', '{"label":"Contact link","value":"Contact","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-support-authentic', 'SITE_CHROME', 'chrome-support-authentic', 'en', '{"label":"Authentic product policy link","value":"Authentic product policy","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-support-order', 'SITE_CHROME', 'chrome-support-order', 'en', '{"label":"How to order link","value":"How to order","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-support-shipping', 'SITE_CHROME', 'chrome-support-shipping', 'en', '{"label":"Shipping link","value":"Shipping and payment","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-support-returns', 'SITE_CHROME', 'chrome-support-returns', 'en', '{"label":"Returns link","value":"Returns and warranty","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tr-chrome-legal-registration', 'SITE_CHROME', 'chrome-legal-registration', 'en', '{"label":"Business registration","value":"Business registration: 0109613491","altText":"","imageCaption":""}'::jsonb, CURRENT_TIMESTAMP, 'shared-controls-v1', 'TRANSLATED', 'migration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("entityType", "entityId", "locale") DO NOTHING;

-- Backfill reviewed English values for pre-existing shared header/footer records.
INSERT INTO "TranslationEntry" ("id", "entityType", "entityId", "locale", "payload", "sourceUpdatedAt", "sourceHash", "status", "provider", "manualOverride", "translatedAt", "reviewedAt", "createdAt", "updatedAt")
SELECT
  'tr-default-' || substring(md5(s."id"), 1, 20),
  'SITE_CHROME',
  s."id",
  'en',
  jsonb_build_object(
    'label', s."label",
    'value', CASE
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'home' THEN 'Home'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'about' THEN 'About'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'products' THEN 'Products'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'news' THEN 'News'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'contact' THEN 'Contact'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'cta' AND s."fieldKey" = 'label' THEN 'Contact us'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'language' AND s."fieldKey" = 'label' THEN 'VI | EN'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'brand' AND s."fieldKey" = 'company' THEN 'GEDECO CORPORATION'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'brand' AND s."fieldKey" = 'tagline' THEN 'Trade and export partner from Vietnam'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'contact' AND s."fieldKey" = 'phone' THEN '0914 94 3653'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'contact' AND s."fieldKey" = 'email' THEN 'info@gedeco.vn'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'contact' AND s."fieldKey" = 'address' THEN '14th Floor, Multifunctional Building, 169 Nguyen Ngoc Vu, Yen Hoa Ward, Hanoi, Vietnam'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'legal' AND s."fieldKey" = 'copyright' THEN '© 2025 GEDECO. All rights reserved.'
      ELSE s."value"
    END,
    'altText', CASE WHEN s."sectionKey" = 'brand' AND s."fieldKey" = 'logo' THEN 'GEDECO' ELSE COALESCE(s."altText", '') END,
    'imageCaption', COALESCE(s."imageCaption", '')
  ),
  s."updatedAt",
  'shared-defaults-v1',
  'TRANSLATED',
  'migration',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "SiteChromeContent" s
WHERE
  (s."area"::text, s."sectionKey", s."fieldKey") IN (
    ('HEADER', 'navigation', 'home'), ('HEADER', 'navigation', 'about'), ('HEADER', 'navigation', 'products'), ('HEADER', 'navigation', 'news'), ('HEADER', 'navigation', 'contact'),
    ('HEADER', 'cta', 'label'), ('HEADER', 'language', 'label'), ('HEADER', 'brand', 'logo'),
    ('FOOTER', 'brand', 'logo'), ('FOOTER', 'brand', 'company'), ('FOOTER', 'brand', 'tagline'),
    ('FOOTER', 'contact', 'phone'), ('FOOTER', 'contact', 'email'), ('FOOTER', 'contact', 'address'),
    ('FOOTER', 'social', 'facebook'), ('FOOTER', 'social', 'youtube'), ('FOOTER', 'legal', 'copyright')
  )
  AND NOT EXISTS (SELECT 1 FROM "TranslationEntry" t WHERE t."entityType" = 'SITE_CHROME' AND t."entityId" = s."id" AND t."locale" = 'en');

UPDATE "TranslationEntry" t SET
  "payload" = jsonb_build_object(
    'label', s."label",
    'value', CASE
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'home' THEN 'Home'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'about' THEN 'About'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'products' THEN 'Products'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'news' THEN 'News'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'navigation' AND s."fieldKey" = 'contact' THEN 'Contact'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'cta' AND s."fieldKey" = 'label' THEN 'Contact us'
      WHEN s."area" = 'HEADER' AND s."sectionKey" = 'language' AND s."fieldKey" = 'label' THEN 'VI | EN'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'brand' AND s."fieldKey" = 'company' THEN 'GEDECO CORPORATION'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'brand' AND s."fieldKey" = 'tagline' THEN 'Trade and export partner from Vietnam'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'contact' AND s."fieldKey" = 'phone' THEN '0914 94 3653'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'contact' AND s."fieldKey" = 'email' THEN 'info@gedeco.vn'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'contact' AND s."fieldKey" = 'address' THEN '14th Floor, Multifunctional Building, 169 Nguyen Ngoc Vu, Yen Hoa Ward, Hanoi, Vietnam'
      WHEN s."area" = 'FOOTER' AND s."sectionKey" = 'legal' AND s."fieldKey" = 'copyright' THEN '© 2025 GEDECO. All rights reserved.'
      ELSE s."value"
    END,
    'altText', CASE WHEN s."sectionKey" = 'brand' AND s."fieldKey" = 'logo' THEN 'GEDECO' ELSE COALESCE(s."altText", '') END,
    'imageCaption', COALESCE(s."imageCaption", '')
  ),
  "sourceUpdatedAt" = s."updatedAt",
  "sourceHash" = 'shared-defaults-v1',
  "status" = 'TRANSLATED',
  "provider" = 'migration',
  "manualOverride" = true,
  "errorMessage" = NULL,
  "translatedAt" = CURRENT_TIMESTAMP,
  "reviewedAt" = CURRENT_TIMESTAMP,
  "updatedAt" = CURRENT_TIMESTAMP
FROM "SiteChromeContent" s
WHERE t."entityType" = 'SITE_CHROME' AND t."entityId" = s."id" AND t."locale" = 'en' AND t."manualOverride" = false
  AND (s."area"::text, s."sectionKey", s."fieldKey") IN (
    ('HEADER', 'navigation', 'home'), ('HEADER', 'navigation', 'about'), ('HEADER', 'navigation', 'products'), ('HEADER', 'navigation', 'news'), ('HEADER', 'navigation', 'contact'),
    ('HEADER', 'cta', 'label'), ('HEADER', 'language', 'label'), ('HEADER', 'brand', 'logo'),
    ('FOOTER', 'brand', 'logo'), ('FOOTER', 'brand', 'company'), ('FOOTER', 'brand', 'tagline'),
    ('FOOTER', 'contact', 'phone'), ('FOOTER', 'contact', 'email'), ('FOOTER', 'contact', 'address'),
    ('FOOTER', 'social', 'facebook'), ('FOOTER', 'social', 'youtube'), ('FOOTER', 'legal', 'copyright')
  );
