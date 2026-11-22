import { prisma } from "./prisma-client.mjs";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const token = Date.now().toString(36);
const viSlug = `qa-product-${token}`;
const enSlug = `qa-product-en-${token}`;
const oldSlug = `qa-product-old-${token}`;
let productId = "";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const category = await prisma.productCategory.findFirst({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
  assert(category, "Không có danh mục sản phẩm để chạy regression.");
  const product = await prisma.product.create({
    data: {
      slug: viSlug,
      title: "Sản phẩm kiểm thử",
      categoryId: category.id,
      description: "Dữ liệu kiểm thử tạm thời",
      summaryHtml: `<p onclick="alert(1)">Nội dung an toàn</p><script>alert(1)</script>`,
      contentHtml: `<h2>Chi tiết kiểm thử</h2><img src="https://evil.example/x.jpg" alt="x"><img src="/assets/logo-new.png" alt="Logo hợp lệ"><a href="javascript:alert(1)">Liên kết lỗi</a>`,
      imageAlt: "Ảnh sản phẩm kiểm thử",
      shipperImageUrl: "/assets/products/shipper.jpg",
      shipperImageAlt: "Ảnh giao hàng kiểm thử",
      shipperImageCaption: "Caption giao hàng kiểm thử",
      isPublished: true,
    },
  });
  productId = product.id;
  const viPath = `/san-pham/${category.slug}/${viSlug}`;
  const viResponse = await fetch(`${baseUrl}${viPath}`, { redirect: "manual" });
  const viHtml = await viResponse.text();
  assert(viResponse.status === 200, `Trang VI trả ${viResponse.status}.`);
  assert(viHtml.includes("Nội dung an toàn") && viHtml.includes("Chi tiết kiểm thử"), "Nội dung HTML hợp lệ không được render.");
  assert(!viHtml.includes("onclick=\"alert(1)\"") && !viHtml.includes("<script>alert(1)</script>"), "HTML nguy hiểm chưa bị loại.");
  assert(!viHtml.includes("evil.example") && !viHtml.includes("javascript:alert"), "URL nguy hiểm chưa bị loại.");
  assert(viHtml.includes("/assets/logo-new.optimized.webp") && viHtml.includes("Logo hợp lệ"), "Ảnh nội bộ hợp lệ không được phân phối bằng WebP.");
  assert(viHtml.includes('alt="Ảnh giao hàng kiểm thử"') && !viHtml.includes('title="Caption giao hàng kiểm thử"'), "Caption ảnh giao hàng VI vẫn đi ra frontend.");

  const catalogResponse = await fetch(`${baseUrl}/api/products?language=vi`);
  const catalogPayload = await catalogResponse.json();
  assert(catalogResponse.status === 200 && catalogPayload.items?.some((item) => item.slug === viSlug), "Sản phẩm đã publish không đi vào catalog API.");
  await prisma.product.update({ where: { id: productId }, data: { isPublished: false } });
  const hiddenCatalog = await fetch(`${baseUrl}/api/products?language=vi`).then((response) => response.json());
  assert(!hiddenCatalog.items?.some((item) => item.slug === viSlug), "Sản phẩm bị ẩn vẫn xuất hiện trong catalog API.");
  const hiddenProductResponse = await fetch(`${baseUrl}${viPath}`, { redirect: "manual" });
  assert(hiddenProductResponse.status === 404, `Sản phẩm bị ẩn phải 404, thực tế ${hiddenProductResponse.status}.`);
  await prisma.product.update({ where: { id: productId }, data: { isPublished: true } });

  await prisma.productCategory.update({ where: { id: category.id }, data: { isPublished: false } });
  const hiddenCategoryList = await fetch(`${baseUrl}/api/product-categories`).then((response) => response.json());
  assert(!hiddenCategoryList.items?.some((item) => item.id === category.id), "Danh mục sản phẩm bị ẩn vẫn xuất hiện trong API.");
  const hiddenCategoryProduct = await fetch(`${baseUrl}${viPath}`, { redirect: "manual" });
  assert(hiddenCategoryProduct.status === 404, `Product thuộc danh mục bị ẩn phải 404, thực tế ${hiddenCategoryProduct.status}.`);
  await prisma.productCategory.update({ where: { id: category.id }, data: { isPublished: true } });

  const now = new Date();
  await prisma.translationEntry.create({
    data: { entityType: "PRODUCT", entityId: productId, locale: "en", slug: enSlug, payload: { title: "Failed English product" }, sourceUpdatedAt: now, sourceHash: token, status: "FAILED", errorMessage: "QA" },
  });
  const enPath = `/en/products/${category.slugEn}/${enSlug}`;
  const failedResponse = await fetch(`${baseUrl}${enPath}`, { redirect: "manual" });
  assert(failedResponse.status === 404, `Bản English FAILED phải 404, thực tế ${failedResponse.status}.`);

  await prisma.translationEntry.update({
    where: { entityType_entityId_locale: { entityType: "PRODUCT", entityId: productId, locale: "en" } },
    data: { status: "TRANSLATED", manualOverride: true, provider: "manual", errorMessage: null, translatedAt: new Date(), payload: { title: "Approved English product", description: "Approved description", summaryHtml: `<p onmouseover="alert(1)">Approved summary</p>`, contentHtml: `<h2>Approved detail</h2><script>alert(2)</script>`, imageAlt: "Approved image alt", shipperImageAlt: "Approved delivery image alt", shipperImageCaption: "Approved delivery caption", metaTitle: "Approved English product", metaDescription: "Approved description" } },
  });
  const translatedResponse = await fetch(`${baseUrl}${enPath}`, { redirect: "manual" });
  const translatedHtml = await translatedResponse.text();
  assert(translatedResponse.status === 200, `Bản English đã duyệt trả ${translatedResponse.status}.`);
  assert(translatedHtml.includes("Approved English product") && translatedHtml.includes("Approved detail"), "Bản English đã duyệt không hiển thị.");
  assert(!translatedHtml.includes("onmouseover=\"alert(1)\"") && !translatedHtml.includes("<script>alert(2)</script>"), "HTML English nguy hiểm chưa bị loại.");
  assert(translatedHtml.includes('alt="Approved delivery image alt"') && !translatedHtml.includes('title="Approved delivery caption"'), "Caption ảnh giao hàng English vẫn đi ra frontend.");
  assert(translatedHtml.includes(`hrefLang="vi" href="https://gedeco.vn${viPath}"`) && translatedHtml.includes(`href="${viPath}"`), "Hreflang hoặc language switcher English không trỏ về URL VI thực tế.");
  const viTranslatedResponse = await fetch(`${baseUrl}${viPath}`);
  const viTranslatedHtml = await viTranslatedResponse.text();
  assert(viTranslatedHtml.includes(`hrefLang="en" href="https://gedeco.vn${enPath}"`) && viTranslatedHtml.includes(`href="${enPath}"`), "Hreflang hoặc language switcher VI không trỏ tới slug English thực tế.");

  const oldPath = `/san-pham/${category.slug}/${oldSlug}`;
  await prisma.urlRedirect.create({ data: { sourcePath: oldPath, destinationPath: viPath } });
  const redirectResponse = await fetch(`${baseUrl}${oldPath}`, { redirect: "manual" });
  assert(redirectResponse.status === 308 && redirectResponse.headers.get("location") === viPath, `Redirect sản phẩm không đúng: ${redirectResponse.status} ${redirectResponse.headers.get("location")}`);

  console.log("PRODUCT_REGRESSION_PASS sanitation visibility failed-translation manual-translation delivery-media-metadata hreflang switcher redirect");
} finally {
  if (productId) {
    await prisma.$transaction([
      prisma.urlRedirect.deleteMany({ where: { OR: [{ sourcePath: { contains: token } }, { destinationPath: { contains: token } }] } }),
      prisma.translationEntry.deleteMany({ where: { entityType: "PRODUCT", entityId: productId } }),
      prisma.product.deleteMany({ where: { id: productId } }),
    ]);
  }
  await prisma.$disconnect();
}
