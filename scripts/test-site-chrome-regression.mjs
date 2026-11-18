import prismaPackage from "@prisma/client";

const { PrismaClient } = prismaPackage;

const prisma = new PrismaClient();
const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const token = Date.now().toString(36);
let row;
let translation;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function chrome(area, lang) {
  const response = await fetch(`${baseUrl}/api/site-chrome?area=${area}&lang=${lang}`);
  assert(response.status === 200, `API ${area}/${lang} trả ${response.status}.`);
  return (await response.json()).values;
}

try {
  row = await prisma.siteChromeContent.findUnique({ where: { area_sectionKey_fieldKey: { area: "FOOTER", sectionKey: "shopBuy", fieldKey: "label" } } });
  assert(row, "Thiếu bản ghi shopBuy.label.");
  translation = await prisma.translationEntry.findUnique({ where: { entityType_entityId_locale: { entityType: "SITE_CHROME", entityId: row.id, locale: "en" } } });
  assert(translation?.status === "TRANSLATED", "shopBuy.label thiếu bản English đã duyệt.");

  const headerVi = await chrome("HEADER", "vi");
  const headerEn = await chrome("HEADER", "en");
  assert(headerVi["navigation.products"]?.value === "Sản phẩm", "Header VI không đọc navigation.products từ database.");
  assert(headerEn["navigation.products"]?.value === "Products" && headerEn["cta.label"]?.value === "Contact us", "Header English không đọc translation đã duyệt.");
  assert(!headerVi["DYNAMIC.brand"] && !headerVi["STATIC.navigation"], "API còn sinh key seed sai cấu trúc.");
  const staleServices = await prisma.siteChromeContent.count({ where: { area: "HEADER", sectionKey: "navigation", fieldKey: "services" } });
  assert(staleServices === 0, "Bản ghi menu Dịch vụ cũ chưa được loại bỏ.");
  await fetch(`${baseUrl}/`);
  const staleContentSeed = await prisma.siteDynamicContent.count({ where: { kind: "STATIC", pageKey: "home", sectionKey: "navigation", fieldKey: "services" } });
  assert(staleContentSeed === 0, "Static seed navigation.services cũ bị dựng lại.");

  const viQa = `MUA QA ${token}`;
  const enQa = `BUY QA ${token}`;
  await prisma.siteChromeContent.update({ where: { id: row.id }, data: { value: viQa } });
  await prisma.translationEntry.update({ where: { id: translation.id }, data: { status: "TRANSLATED", payload: { ...(translation.payload || {}), value: enQa } } });
  assert((await chrome("FOOTER", "vi"))["shopBuy.label"]?.value === viQa, "Thay đổi VI không đi từ database ra API frontend.");
  assert((await chrome("FOOTER", "en"))["shopBuy.label"]?.value === enQa, "Thay đổi English không đi từ database ra API frontend.");

  await prisma.siteChromeContent.update({ where: { id: row.id }, data: { isVisible: false } });
  assert(!("shopBuy.label" in await chrome("FOOTER", "vi")), "Ẩn bản ghi VI vẫn bị seed fallback dựng lại.");
  assert(!("shopBuy.label" in await chrome("FOOTER", "en")), "Ẩn bản ghi English vẫn bị seed fallback dựng lại.");

  const featured = await fetch(`${baseUrl}/api/featured-news?lang=vi`).then((response) => response.json());
  const expectedNews = await prisma.newsArticle.findFirst({ where: { status: "PUBLISHED", OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] }, orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }] });
  if (expectedNews) assert(featured.items?.some((item) => item.id === expectedNews.id), "Sidebar sản phẩm không lấy tin nổi bật thật từ database.");

  console.log("SITE_CHROME_REGRESSION_PASS bilingual db-flow visibility seed-keys featured-news");
} finally {
  if (row) await prisma.siteChromeContent.update({ where: { id: row.id }, data: { value: row.value, isVisible: row.isVisible } });
  if (translation) await prisma.translationEntry.update({ where: { id: translation.id }, data: { payload: translation.payload, status: translation.status, manualOverride: translation.manualOverride, provider: translation.provider, errorMessage: translation.errorMessage, sourceHash: translation.sourceHash, sourceUpdatedAt: translation.sourceUpdatedAt, translatedAt: translation.translatedAt, reviewedAt: translation.reviewedAt } });
  await prisma.$disconnect();
}
