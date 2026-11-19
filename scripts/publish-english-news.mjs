import crypto from "node:crypto";
import { prisma } from "./prisma-client.mjs";

const translations = {
  "bai-viet-kiem-thu-module": {
    slug: "module-test-article",
    title: "Module Test Article",
    category: "News",
    excerpt: "A short description for the publishing module test.",
    content: "Detailed content saved from the news publishing module.",
    metaTitle: "Module Test Article | GEDECO",
    metaDescription: "A test article for the GEDECO news publishing module.",
    tags: ["test", "gedeco"],
  },
  "co-hoi-xuat-khau-nong-san-viet-sang-chau-au-2026": {
    slug: "opportunities-for-vietnamese-agricultural-exports-to-europe-in-2026",
    title: "Opportunities for Vietnamese Agricultural Exports to Europe in 2026",
    category: "Markets",
    excerpt: "Quality products with clear origins and a strong product story are creating new opportunities for Vietnamese agriculture.",
    content: "International markets are increasingly interested in products with clear origins, consistent quality and transparent processes.\n## Building from reliable sources\nGEDECO works with producers to standardize product information, develop a clear product story and find suitable partners.\n## Connecting with the right market\nEach product needs to reach the right customer group, meet the right standards and follow the right cooperation model for long-term growth.",
    metaTitle: "Opportunities for Vietnamese Agricultural Exports to Europe in 2026 | GEDECO",
    metaDescription: "Positive signals from the European market are opening new opportunities for Vietnamese businesses.",
    tags: ["agriculture", "export", "sourcing"],
  },
  "xay-dung-chuoi-cung-ung-linh-hoat": {
    slug: "building-a-flexible-supply-chain-for-vietnamese-products",
    title: "Building a Flexible Supply Chain for Vietnamese Products",
    category: "Sourcing",
    excerpt: "A stable supply and transparent processes are the foundation for sustainable commercial growth.",
    content: "For long-term growth, businesses need to manage the full path from raw-material regions and processors to distribution channels.\n## Transparency at every stage\nClear product, standards and supply-capacity information helps partners build trust from the start.\n## Growing together with partners\nGEDECO connects businesses with complementary capabilities to build stable commercial relationships.",
    metaTitle: "Building a Flexible Supply Chain for Vietnamese Products | GEDECO",
    metaDescription: "A flexible supply chain helps businesses respond to changes in costs, demand and delivery times.",
    tags: ["sourcing", "trade", "partnerships"],
  },
  "logistics-xanh-xu-huong-phat-trien-ben-vung": {
    slug: "sustainable-products-and-new-consumer-trends",
    title: "Sustainable Products and New Consumer Trends",
    category: "Products",
    excerpt: "Consumers are paying closer attention to origin, quality and responsibility throughout a product's lifecycle.",
    content: "Sustainable product development starts with materials, processing and transparent communication with the market.\n## Value from clear origins\nWell-controlled sourcing helps Vietnamese products stand out and reach international partners.\n## Long-term cooperation\nGEDECO prioritizes responsible partnerships that improve product quality and value together.",
    metaTitle: "Sustainable Products and New Consumer Trends | GEDECO",
    metaDescription: "Optimized transport routes and less waste across the supply chain are foundations for sustainable logistics.",
    tags: ["products", "sustainability", "markets"],
  },
  "ket-noi-doanh-nghiep-viet-nhat-mo-rong-hop-tac": {
    slug: "connecting-vietnamese-businesses-with-international-partners",
    title: "Connecting Vietnamese Businesses with International Partners",
    category: "Partnerships",
    excerpt: "Trust, transparency and market understanding are the foundation of long-term partnerships.",
    content: "GEDECO connects producers, processors and customers looking for suitable Vietnamese products.\n## Understanding needs clearly\nClear discussions about standards, specifications and supply capacity help both sides shorten the evaluation process.\n## Growing together\nA partnership is more than a single transaction; it is a stable commercial relationship built on shared value.",
    metaTitle: "Connecting Vietnamese Businesses with International Partners | GEDECO",
    metaDescription: "Trust, stability and transparency help Vietnamese businesses build long-term relationships with international partners.",
    tags: ["partners", "cooperation", "Vietnamese products"],
  },
  "ho-so-xuat-khau-can-chuan-bi-nhung-gi": {
    slug: "what-vietnamese-products-need-before-exporting",
    title: "What Do Vietnamese Products Need Before Exporting?",
    category: "Knowledge & Insights",
    excerpt: "Standardized product information, specifications and documentation are important before approaching international partners.",
    content: "A complete information pack helps partners quickly assess product quality and supply capacity.\n## Keep key information clear\nBusinesses should prepare origin, standards, packaging specifications, production capacity and product images.\n## Prepare for the right connection\nGEDECO helps businesses present products clearly and find suitable partner groups.",
    metaTitle: "What Do Vietnamese Products Need Before Exporting? | GEDECO",
    metaDescription: "A complete export information pack helps shorten processing time and reduce issues during international trade.",
    tags: ["export", "knowledge", "sourcing"],
  },
  "tu-nguon-hang-den-giao-nhan-cung-mot-dau-moi": {
    slug: "from-sourcing-to-delivery-one-connected-point-of-contact",
    title: "From Sourcing to Delivery: One Connected Point of Contact",
    category: "GEDECO Activities",
    excerpt: "One coordinated point of contact helps businesses follow the full process from sourcing to customer connection.",
    content: "GEDECO supports businesses as they understand demand, select reliable sources and connect with partners.\n## Coordinated from start to finish\nConsistent information exchange helps every party prepare products and cooperation plans with greater confidence.\n## Creating long-term value\nEvery connection is built on quality, transparency and a shared commitment to sustainable growth.",
    metaTitle: "From Sourcing to Delivery: One Connected Point of Contact | GEDECO",
    metaDescription: "A single point of contact helps businesses reduce communication time and track order progress from start to finish.",
    tags: ["GEDECO", "sourcing", "connection"],
  },
};

const now = new Date();
const sources = await prisma.newsArticle.findMany({ where: { slug: { in: Object.keys(translations) } } });
const sourceBySlug = new Map(sources.map((source) => [source.slug, source]));
const missing = Object.keys(translations).filter((slug) => !sourceBySlug.has(slug));
if (missing.length) throw new Error(`Không tìm thấy bài nguồn: ${missing.join(", ")}`);

for (const [sourceSlug, translation] of Object.entries(translations)) {
  const source = sourceBySlug.get(sourceSlug);
  const payload = {
    ...translation,
    imageAlt: translation.title,
    imageCaption: "",
    ogImageAlt: translation.title,
    focusKeyword: translation.tags[0] || "GEDECO",
  };
  const sourceHash = crypto.createHash("sha256").update(JSON.stringify({ sourceUpdatedAt: source.updatedAt.toISOString(), payload })).digest("hex");
  await prisma.$transaction([
    prisma.newsArticle.update({ where: { id: source.id }, data: { status: "PUBLISHED", publishedAt: source.publishedAt || now, scheduledAt: null } }),
    prisma.translationEntry.upsert({
      where: { entityType_entityId_locale: { entityType: "NEWS_ARTICLE", entityId: source.id, locale: "en" } },
      create: { entityType: "NEWS_ARTICLE", entityId: source.id, locale: "en", slug: translation.slug, payload, sourceUpdatedAt: source.updatedAt, sourceHash, status: "TRANSLATED", provider: "manual", manualOverride: true, translatedAt: now, reviewedAt: now },
      update: { slug: translation.slug, payload, sourceUpdatedAt: source.updatedAt, sourceHash, status: "TRANSLATED", provider: "manual", manualOverride: true, errorMessage: null, translatedAt: now, reviewedAt: now },
    }),
  ]);
}

console.log(`Đã public ${sources.length} bài English với bản dịch hợp lệ.`);
await prisma.$disconnect();
