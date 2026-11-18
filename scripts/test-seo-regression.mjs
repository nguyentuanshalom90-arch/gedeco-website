const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const officialOrigin = "https://gedeco.vn";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function decode(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
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

for (const oldPath of ["/doi-tac", "/du-an", "/tin-tuc/chi-tiet"]) {
  const response = await fetch(`${baseUrl}${oldPath}`, { redirect: "manual" });
  assert(response.status === 404 || response.status === 308, `Route cũ ${oldPath} không được loại bỏ/redirect đúng: ${response.status}.`);
}

console.log(`SEO_REGRESSION_PASS robots sitemap status lang canonical urls=${uniqueLocs.length} removed-routes`);
