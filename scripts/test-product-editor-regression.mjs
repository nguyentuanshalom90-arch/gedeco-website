import { prisma } from "./prisma-client.mjs";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const token = Date.now().toString(36);
const viSlug = `qa-word-editor-${token}`;
const enSlug = `qa-word-editor-en-${token}`;
let productId = "";
let category;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function getHtml(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  return { response, html: await response.text() };
}

try {
  category = await prisma.productCategory.findFirst({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
  assert(category, "Không có danh mục sản phẩm để tạo dữ liệu demo.");

  // Vòng 1: kiểm tra một sản phẩm thật đang có, không tạo thay đổi dữ liệu.
  const existing = await prisma.product.findFirst({ where: { isPublished: true }, include: { category: true }, orderBy: { sortOrder: "asc" } });
  assert(existing, "Không có sản phẩm hiện hữu để kiểm thử vòng 1.");
  const existingPage = await getHtml(`/san-pham/${existing.category.slug}/${existing.slug}`);
  assert(existingPage.response.status === 200 && existingPage.html.includes(existing.title), "Vòng 1 thất bại: sản phẩm hiện hữu không render.");
  console.log("RICH_EDITOR_ROUND_1_PASS existing-product");

  const demo = await prisma.product.create({
    data: {
      slug: viSlug,
      title: "Demo Word editor GEDECO",
      categoryId: category.id,
      description: `<p><span style="font-size:24px;color:#164f89;background-color:#fff59d">Mô tả demo có cỡ chữ, màu chữ và màu nền.</span></p>`,
      summaryHtml: `<p><span style="font-size:18px;color:#b42318;background-color:#d1fae5">Tóm tắt demo tiếng Việt.</span></p><p><span style="background-color:transparent">Không màu nền.</span></p><script>alert(1)</script>`,
      contentHtml: `<h2>Tiêu đề demo</h2><p><span style="font-size:28px;color:#164f89;background-color:#fff59d">Nội dung chi tiết demo.</span></p><span style="font-size:99px;color:red;background-image:url(https://evil.example/x)">Không được phép</span>`,
      imageAlt: "Ảnh demo Word editor",
      shipperImageUrl: "/assets/products/shipper.jpg",
      shipperImageAlt: "Ảnh giao hàng demo",
      isPublished: true,
    },
  });
  productId = demo.id;
  const viPath = `/san-pham/${category.slug}/${viSlug}`;

  // Vòng 2: dữ liệu demo mới render được trên frontend.
  const demoPage = await getHtml(viPath);
  assert(demoPage.response.status === 200 && demoPage.html.includes("Demo Word editor GEDECO") && demoPage.html.includes("Nội dung chi tiết demo"), "Vòng 2 thất bại: demo không render.");
  console.log("RICH_EDITOR_ROUND_2_PASS demo-render");

  // Vòng 3: cỡ chữ inline được giữ lại sau sanitizer.
  assert(demoPage.html.includes("font-size:28px") && demoPage.html.includes("font-size:18px"), "Vòng 3 thất bại: font-size không được giữ.");
  console.log("RICH_EDITOR_ROUND_3_PASS font-size");

  // Vòng 4: màu chữ và màu nền đánh dấu được giữ lại.
  assert(demoPage.html.includes("color:#164f89") && demoPage.html.includes("background-color:#fff59d") && demoPage.html.includes("Không màu nền"), "Vòng 4 thất bại: màu chữ/nền hoặc trạng thái không màu không được giữ.");
  console.log("RICH_EDITOR_ROUND_4_PASS colors-highlight");

  // Vòng 5: nội dung nguy hiểm và style ngoài whitelist bị loại.
  assert(!demoPage.html.includes("<script>alert(1)</script>") && !demoPage.html.includes("background-image") && !demoPage.html.includes("evil.example"), "Vòng 5 thất bại: sanitizer còn để lọt HTML/style nguy hiểm.");
  console.log("RICH_EDITOR_ROUND_5_PASS sanitization");

  await prisma.translationEntry.create({
    data: {
      entityType: "PRODUCT", entityId: productId, locale: "en", slug: enSlug, status: "TRANSLATED", manualOverride: true,
      payload: {
        title: "GEDECO Word editor demo", description: `<p><span style="font-size:20px;color:#166534;background-color:#fef08a">English short description.</span></p>`,
        summaryHtml: `<p><span style="font-size:16px;color:#164f89;background-color:#dbeafe">English summary.</span></p>`,
        contentHtml: `<p><span style="font-size:24px;color:#164f89;background-color:#fff59d">English detail.</span><script>alert(2)</script></p>`,
        imageAlt: "English demo image", metaTitle: "GEDECO Word editor demo", metaDescription: "English demo description",
      },
      sourceUpdatedAt: new Date(), sourceHash: token, translatedAt: new Date(), provider: "manual",
    },
  });
  const enPath = `/en/products/${category.slugEn}/${enSlug}`;
  const enPage = await getHtml(enPath);

  // Vòng 6: bản English cũng render đủ style và được sanitize.
  assert(enPage.response.status === 200 && enPage.html.includes("English detail.") && enPage.html.includes("font-size:24px") && enPage.html.includes("background-color:#fff59d") && !enPage.html.includes("<script>alert(2)</script>"), "Vòng 6 thất bại: English rich editor không round-trip đúng.");
  console.log("RICH_EDITOR_ROUND_6_PASS english-round-trip");

  // Vòng 7: kiểm tra catalog/public visibility rồi khôi phục trạng thái demo.
  const catalog = await fetch(`${baseUrl}/api/products?language=vi`).then((response) => response.json());
  assert(catalog.items?.some((item) => item.slug === viSlug), "Vòng 7 thất bại: demo không có trong catalog.");
  await prisma.product.update({ where: { id: productId }, data: { isPublished: false } });
  const hidden = await getHtml(viPath);
  assert(hidden.response.status === 404, "Vòng 7 thất bại: demo bị ẩn vẫn public.");
  console.log("RICH_EDITOR_ROUND_7_PASS visibility");
} finally {
  if (productId) await prisma.product.deleteMany({ where: { id: productId } });
  await prisma.$disconnect();
}

console.log("RICH_EDITOR_REGRESSION_PASS 7-rounds demo-created-and-cleaned");
