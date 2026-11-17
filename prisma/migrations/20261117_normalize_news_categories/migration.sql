-- Normalize only known legacy slugs. IDs and article relations remain unchanged.
UPDATE "NewsCategory" AS category
SET "slug" = 'chuoi-cung-ung', "updatedAt" = CURRENT_TIMESTAMP
WHERE category."name" = 'Chuỗi cung ứng'
  AND category."slug" = 'ho-i-cng-ng'
  AND NOT EXISTS (
    SELECT 1 FROM "NewsCategory" AS existing
    WHERE existing."slug" = 'chuoi-cung-ung' AND existing."id" <> category."id"
  );

UPDATE "NewsCategory" AS category
SET "slug" = 'hoat-dong-gedeco', "updatedAt" = CURRENT_TIMESTAMP
WHERE category."name" = 'Hoạt động GEDECO'
  AND category."slug" = 'oa-t-o-ng'
  AND NOT EXISTS (
    SELECT 1 FROM "NewsCategory" AS existing
    WHERE existing."slug" = 'hoat-dong-gedeco' AND existing."id" <> category."id"
  );

UPDATE "NewsCategory" AS category
SET "slug" = 'hop-tac', "updatedAt" = CURRENT_TIMESTAMP
WHERE category."name" = 'Hợp tác'
  AND category."slug" = 'o-p-ta-c'
  AND NOT EXISTS (
    SELECT 1 FROM "NewsCategory" AS existing
    WHERE existing."slug" = 'hop-tac' AND existing."id" <> category."id"
  );

UPDATE "NewsCategory" AS category
SET "slug" = 'kien-thuc-chia-se', "updatedAt" = CURRENT_TIMESTAMP
WHERE category."name" = 'Kiến thức & chia sẻ'
  AND category."slug" = 'ie-n-th-c-chia-se'
  AND NOT EXISTS (
    SELECT 1 FROM "NewsCategory" AS existing
    WHERE existing."slug" = 'kien-thuc-chia-se' AND existing."id" <> category."id"
  );

UPDATE "NewsCategory" AS category
SET "slug" = 'logistics', "updatedAt" = CURRENT_TIMESTAMP
WHERE category."name" = 'Logistics'
  AND category."slug" = 'ogistics'
  AND NOT EXISTS (
    SELECT 1 FROM "NewsCategory" AS existing
    WHERE existing."slug" = 'logistics' AND existing."id" <> category."id"
  );

UPDATE "NewsCategory" AS category
SET "slug" = 'thi-truong', "updatedAt" = CURRENT_TIMESTAMP
WHERE category."name" = 'Thị trường'
  AND category."slug" = 'hi-tr-o-ng'
  AND NOT EXISTS (
    SELECT 1 FROM "NewsCategory" AS existing
    WHERE existing."slug" = 'thi-truong' AND existing."id" <> category."id"
  );

-- Fill missing bilingual and SEO content without overwriting non-empty admin data.
UPDATE "NewsCategory"
SET
  "description" = COALESCE(NULLIF(BTRIM("description"), ''), 'Cập nhật tin tức, hoạt động và cơ hội hợp tác mới nhất từ GEDECO.'),
  "nameEn" = COALESCE(NULLIF(BTRIM("nameEn"), ''), 'News'),
  "slugEn" = CASE WHEN NULLIF(BTRIM("slugEn"), '') IS NULL
    AND NOT EXISTS (SELECT 1 FROM "NewsCategory" existing WHERE existing."slugEn" = 'news' AND existing."id" <> "NewsCategory"."id")
    THEN 'news' ELSE NULLIF(BTRIM("slugEn"), '') END,
  "descriptionEn" = COALESCE(NULLIF(BTRIM("descriptionEn"), ''), 'Latest news, GEDECO activities and cooperation opportunities.'),
  "metaTitle" = COALESCE(NULLIF(BTRIM("metaTitle"), ''), 'Tin tức GEDECO | Cập nhật mới nhất'),
  "metaDescription" = COALESCE(NULLIF(BTRIM("metaDescription"), ''), 'Cập nhật tin tức, hoạt động, thị trường và cơ hội hợp tác mới nhất từ GEDECO.'),
  "metaTitleEn" = COALESCE(NULLIF(BTRIM("metaTitleEn"), ''), 'GEDECO News | Latest Updates'),
  "metaDescriptionEn" = COALESCE(NULLIF(BTRIM("metaDescriptionEn"), ''), 'Read the latest GEDECO news, activities, market updates and cooperation opportunities.'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Tin tức';

UPDATE "NewsCategory"
SET
  "description" = COALESCE(NULLIF(BTRIM("description"), ''), 'Phân tích, giải pháp và cập nhật về chuỗi cung ứng nông sản trong nước và quốc tế.'),
  "nameEn" = COALESCE(NULLIF(BTRIM("nameEn"), ''), 'Supply Chain'),
  "slugEn" = CASE WHEN NULLIF(BTRIM("slugEn"), '') IS NULL
    AND NOT EXISTS (SELECT 1 FROM "NewsCategory" existing WHERE existing."slugEn" = 'supply-chain' AND existing."id" <> "NewsCategory"."id")
    THEN 'supply-chain' ELSE NULLIF(BTRIM("slugEn"), '') END,
  "descriptionEn" = COALESCE(NULLIF(BTRIM("descriptionEn"), ''), 'Insights, solutions and updates on domestic and international agricultural supply chains.'),
  "metaTitle" = COALESCE(NULLIF(BTRIM("metaTitle"), ''), 'Chuỗi cung ứng nông sản | GEDECO'),
  "metaDescription" = COALESCE(NULLIF(BTRIM("metaDescription"), ''), 'Thông tin và giải pháp chuỗi cung ứng nông sản trong nước, xuất khẩu và logistics từ GEDECO.'),
  "metaTitleEn" = COALESCE(NULLIF(BTRIM("metaTitleEn"), ''), 'Agricultural Supply Chain | GEDECO'),
  "metaDescriptionEn" = COALESCE(NULLIF(BTRIM("metaDescriptionEn"), ''), 'Explore agricultural supply chain, export and logistics insights from GEDECO.'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Chuỗi cung ứng';

UPDATE "NewsCategory"
SET
  "description" = COALESCE(NULLIF(BTRIM("description"), ''), 'Các hoạt động nổi bật, sự kiện và dấu mốc phát triển của GEDECO.'),
  "nameEn" = COALESCE(NULLIF(BTRIM("nameEn"), ''), 'GEDECO Activities'),
  "slugEn" = CASE WHEN NULLIF(BTRIM("slugEn"), '') IS NULL
    AND NOT EXISTS (SELECT 1 FROM "NewsCategory" existing WHERE existing."slugEn" = 'gedeco-activities' AND existing."id" <> "NewsCategory"."id")
    THEN 'gedeco-activities' ELSE NULLIF(BTRIM("slugEn"), '') END,
  "descriptionEn" = COALESCE(NULLIF(BTRIM("descriptionEn"), ''), 'Highlights, events and development milestones from GEDECO.'),
  "metaTitle" = COALESCE(NULLIF(BTRIM("metaTitle"), ''), 'Hoạt động GEDECO | Sự kiện và dấu mốc'),
  "metaDescription" = COALESCE(NULLIF(BTRIM("metaDescription"), ''), 'Theo dõi hoạt động, sự kiện và các dấu mốc phát triển mới nhất của GEDECO.'),
  "metaTitleEn" = COALESCE(NULLIF(BTRIM("metaTitleEn"), ''), 'GEDECO Activities | Events and Milestones'),
  "metaDescriptionEn" = COALESCE(NULLIF(BTRIM("metaDescriptionEn"), ''), 'Follow GEDECO activities, events and the latest company development milestones.'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Hoạt động GEDECO';

UPDATE "NewsCategory"
SET
  "description" = COALESCE(NULLIF(BTRIM("description"), ''), 'Thông tin hợp tác, kết nối đối tác và cơ hội phát triển cùng GEDECO.'),
  "nameEn" = COALESCE(NULLIF(BTRIM("nameEn"), ''), 'Partnerships'),
  "slugEn" = CASE WHEN NULLIF(BTRIM("slugEn"), '') IS NULL
    AND NOT EXISTS (SELECT 1 FROM "NewsCategory" existing WHERE existing."slugEn" = 'partnerships' AND existing."id" <> "NewsCategory"."id")
    THEN 'partnerships' ELSE NULLIF(BTRIM("slugEn"), '') END,
  "descriptionEn" = COALESCE(NULLIF(BTRIM("descriptionEn"), ''), 'Partnership updates, partner connections and opportunities to grow with GEDECO.'),
  "metaTitle" = COALESCE(NULLIF(BTRIM("metaTitle"), ''), 'Hợp tác cùng GEDECO | Kết nối và phát triển'),
  "metaDescription" = COALESCE(NULLIF(BTRIM("metaDescription"), ''), 'Khám phá thông tin hợp tác, kết nối đối tác và cơ hội phát triển bền vững cùng GEDECO.'),
  "metaTitleEn" = COALESCE(NULLIF(BTRIM("metaTitleEn"), ''), 'Partner with GEDECO | Connect and Grow'),
  "metaDescriptionEn" = COALESCE(NULLIF(BTRIM("metaDescriptionEn"), ''), 'Discover partnership updates, partner connections and sustainable growth opportunities with GEDECO.'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Hợp tác';

UPDATE "NewsCategory"
SET
  "description" = COALESCE(NULLIF(BTRIM("description"), ''), 'Kiến thức thực tiễn và góc nhìn chuyên môn về nông sản, thị trường và xuất khẩu.'),
  "nameEn" = COALESCE(NULLIF(BTRIM("nameEn"), ''), 'Knowledge & Insights'),
  "slugEn" = CASE WHEN NULLIF(BTRIM("slugEn"), '') IS NULL
    AND NOT EXISTS (SELECT 1 FROM "NewsCategory" existing WHERE existing."slugEn" = 'knowledge-insights' AND existing."id" <> "NewsCategory"."id")
    THEN 'knowledge-insights' ELSE NULLIF(BTRIM("slugEn"), '') END,
  "descriptionEn" = COALESCE(NULLIF(BTRIM("descriptionEn"), ''), 'Practical knowledge and expert insights on agriculture, markets and exports.'),
  "metaTitle" = COALESCE(NULLIF(BTRIM("metaTitle"), ''), 'Kiến thức và chia sẻ ngành nông sản | GEDECO'),
  "metaDescription" = COALESCE(NULLIF(BTRIM("metaDescription"), ''), 'Kiến thức thực tiễn và góc nhìn chuyên môn về nông sản, thị trường, logistics và xuất khẩu.'),
  "metaTitleEn" = COALESCE(NULLIF(BTRIM("metaTitleEn"), ''), 'Agricultural Knowledge & Insights | GEDECO'),
  "metaDescriptionEn" = COALESCE(NULLIF(BTRIM("metaDescriptionEn"), ''), 'Practical knowledge and expert insights on agriculture, markets, logistics and exports.'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Kiến thức & chia sẻ';

UPDATE "NewsCategory"
SET
  "description" = COALESCE(NULLIF(BTRIM("description"), ''), 'Cập nhật vận tải, kho bãi và giải pháp logistics cho chuỗi cung ứng nông sản.'),
  "nameEn" = COALESCE(NULLIF(BTRIM("nameEn"), ''), 'Logistics'),
  "slugEn" = CASE WHEN NULLIF(BTRIM("slugEn"), '') IS NULL
    AND NOT EXISTS (SELECT 1 FROM "NewsCategory" existing WHERE existing."slugEn" = 'logistics' AND existing."id" <> "NewsCategory"."id")
    THEN 'logistics' ELSE NULLIF(BTRIM("slugEn"), '') END,
  "descriptionEn" = COALESCE(NULLIF(BTRIM("descriptionEn"), ''), 'Updates on transportation, warehousing and logistics solutions for agricultural supply chains.'),
  "metaTitle" = COALESCE(NULLIF(BTRIM("metaTitle"), ''), 'Logistics nông sản và xuất khẩu | GEDECO'),
  "metaDescription" = COALESCE(NULLIF(BTRIM("metaDescription"), ''), 'Cập nhật vận tải, kho bãi và giải pháp logistics cho chuỗi cung ứng nông sản và xuất khẩu.'),
  "metaTitleEn" = COALESCE(NULLIF(BTRIM("metaTitleEn"), ''), 'Agricultural and Export Logistics | GEDECO'),
  "metaDescriptionEn" = COALESCE(NULLIF(BTRIM("metaDescriptionEn"), ''), 'Transportation, warehousing and logistics updates for agricultural supply chains and exports.'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Logistics';

UPDATE "NewsCategory"
SET
  "description" = COALESCE(NULLIF(BTRIM("description"), ''), 'Tin tức, xu hướng và phân tích thị trường nông sản trong nước và quốc tế.'),
  "nameEn" = COALESCE(NULLIF(BTRIM("nameEn"), ''), 'Markets'),
  "slugEn" = CASE WHEN NULLIF(BTRIM("slugEn"), '') IS NULL
    AND NOT EXISTS (SELECT 1 FROM "NewsCategory" existing WHERE existing."slugEn" = 'markets' AND existing."id" <> "NewsCategory"."id")
    THEN 'markets' ELSE NULLIF(BTRIM("slugEn"), '') END,
  "descriptionEn" = COALESCE(NULLIF(BTRIM("descriptionEn"), ''), 'News, trends and analysis of domestic and international agricultural markets.'),
  "metaTitle" = COALESCE(NULLIF(BTRIM("metaTitle"), ''), 'Thị trường nông sản trong nước và quốc tế'),
  "metaDescription" = COALESCE(NULLIF(BTRIM("metaDescription"), ''), 'Cập nhật tin tức, xu hướng và phân tích thị trường nông sản trong nước và quốc tế từ GEDECO.'),
  "metaTitleEn" = COALESCE(NULLIF(BTRIM("metaTitleEn"), ''), 'Domestic and International Agricultural Markets'),
  "metaDescriptionEn" = COALESCE(NULLIF(BTRIM("metaDescriptionEn"), ''), 'News, trends and analysis of domestic and international agricultural markets from GEDECO.'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Thị trường';
