import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const officialOrigin = "https://gedeco.vn";
const sourceRoots = ["app", "lib", "prisma", "public"];
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".prisma", ".html", ".xml", ".txt"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function decode(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
}

async function scanSourceCompliance(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await scanSourceCompliance(fullPath);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name).toLowerCase()) || entry.name.endsWith(".map")) continue;
    const content = await readFile(fullPath, "utf8");
    assert(!/codex/i.test(content), `Source/content chứa chuỗi nội bộ không được phép: ${fullPath}.`);
    assert(!/(?<![A-Za-z])AI(?![A-Za-z])/.test(content), `Source/content chứa nhãn AI không được phép: ${fullPath}.`);
    assert(!/http:\/\/(?:www\.)?gedeco\.vn(?:[/:?]|$)/i.test(content), `Source/content còn URL HTTP của domain chính thức: ${fullPath}.`);
  }
}

for (const root of sourceRoots) await scanSourceCompliance(root);
for (const sourcePath of ["app/doi-tac/page.tsx", "app/du-an/page.tsx", "app/en/gioi-thieu/page.tsx"]) {
  try {
    await readFile(sourcePath);
    throw new Error(`Route không nằm trong header/footer vẫn còn trong source: ${sourcePath}.`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Route không nằm")) throw error;
  }
}

const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
const robots = await robotsResponse.text();
assert(robotsResponse.status === 200, `robots.txt trả ${robotsResponse.status}.`);
assert(robots.includes("Sitemap: https://gedeco.vn/sitemap.xml"), "robots.txt thiếu sitemap canonical.");

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
const sitemap = await sitemapResponse.text();
assert(sitemapResponse.status === 200, `sitemap.xml trả ${sitemapResponse.status}.`);
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decode(match[1]));
assert(locs.length > 0, "Sitemap không có URL.");
assert(locs.every((url) => url.startsWith(`${officialOrigin}/`) || url === officialOrigin), "Sitemap chứa hostname ngoài domain chính thức.");
assert(!sitemap.includes("localhost") && !sitemap.includes("demo."), "Sitemap chứa URL local/demo.");

const uniqueLocs = [...new Set(locs)];
for (const url of uniqueLocs) {
  const parsed = new URL(url);
  const response = await fetch(`${baseUrl}${parsed.pathname}${parsed.search}`, { redirect: "manual" });
  const html = await response.text();
  assert(response.status === 200, `Sitemap URL ${url} trả ${response.status}.`);
  const lang = html.match(/<html[^>]*\slang="([^"]+)"/i)?.[1];
  assert(lang === "vi" || lang === "en", `URL ${url} thiếu html lang hợp lệ.`);
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1];
  assert(canonical && (canonical === officialOrigin || canonical.startsWith(`${officialOrigin}/`)), `URL ${url} thiếu canonical chính thức.`);
}

const contactHtml = await fetch(`${baseUrl}/lien-he`).then((response) => response.text());
assert(contactHtml.includes("Đóng thông báo") && contactHtml.includes("Gửi thành công") && contactHtml.includes("Vui lòng kiểm tra lại"), "Nhãn trạng thái form liên hệ chưa đi từ SiteContent database ra frontend.");

for (const oldPath of ["/doi-tac", "/du-an", "/en/gioi-thieu", "/tin-tuc/chi-tiet"]) {
  const response = await fetch(`${baseUrl}${oldPath}`, { redirect: "manual" });
  assert(response.status === 404 || response.status === 308, `Route cũ ${oldPath} không được loại bỏ/redirect đúng: ${response.status}.`);
}

console.log(`SEO_REGRESSION_PASS robots sitemap status lang canonical urls=${uniqueLocs.length} removed-routes source-compliance`);
