import { readFile } from "node:fs/promises";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function loadLocalEnv() {
  const values = {};
  try {
    const source = await readFile(".env.local", "utf8");
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // CI can provide the required values directly through process.env.
  }
  return { ...values, ...process.env };
}

function cookieFrom(response) {
  const setCookies = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") || ""];
  const value = setCookies.find((item) => item.startsWith("gedeco_dashboard_session="));
  assert(value, "Auth không trả session cookie.");
  return value.split(";", 1)[0];
}

const env = await loadLocalEnv();
assert(env.DASHBOARD_USERNAME && env.DASHBOARD_PASSWORD, "Thiếu credentials dashboard cho regression.");

const loginPage = await fetch(`${baseUrl}/vmg-login`);
const loginHtml = await loginPage.text();
assert(loginPage.status === 200 && loginHtml.includes("Quản trị GEDECO"), "Route /vmg-login không render được trang đăng nhập.");
assert(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(loginHtml), "Route /vmg-login phải có robots noindex.");

const invalid = await fetch(`${baseUrl}/api/dashboard/auth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: env.DASHBOARD_USERNAME, password: `${env.DASHBOARD_PASSWORD}-invalid` }),
});
assert(invalid.status === 401, `Sai credentials phải trả 401, thực tế ${invalid.status}.`);

const auth = await fetch(`${baseUrl}/api/dashboard/auth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: env.DASHBOARD_USERNAME, password: env.DASHBOARD_PASSWORD }),
});
assert(auth.status === 200, `Đăng nhập hợp lệ phải trả 200, thực tế ${auth.status}.`);
const cookie = cookieFrom(auth);

const dashboard = await fetch(`${baseUrl}/dashboard`, { headers: { Cookie: cookie } });
const dashboardHtml = await dashboard.text();
assert(dashboard.status === 200 && dashboardHtml.includes("Tổng quan"), "Session hợp lệ không mở được dashboard.");

const dashboardTabs = [
  ["posts", "Quản lý bài viết"],
  ["products", "Sản phẩm"],
  ["site-content", "Quản lý nội dung"],
  ["payment", "Thanh toán"],
  ["shipping", "Vận chuyển"],
];
for (const [tab, marker] of dashboardTabs) {
  const response = await fetch(`${baseUrl}/dashboard?view=dashboard&tab=${tab}`, { headers: { Cookie: cookie } });
  const html = await response.text();
  assert(response.status === 200 && html.includes(marker), `Dashboard tab ${tab} không render đúng màn hình.`);
}

for (const legacyTab of ["pages", "content", "chrome", "media"]) {
  const response = await fetch(`${baseUrl}/dashboard?view=dashboard&tab=${legacyTab}`, { headers: { Cookie: cookie } });
  const html = await response.text();
  assert(response.status === 200 && html.includes("Tổng quan") && !html.includes("Quản lý page"), `Legacy dashboard tab ${legacyTab} chưa được đưa về màn hình mặc định.`);
}

const unauthenticatedMedia = await fetch(`${baseUrl}/api/media`);
assert(unauthenticatedMedia.status === 401, `Media API chưa đăng nhập phải trả 401, thực tế ${unauthenticatedMedia.status}.`);

const media = await fetch(`${baseUrl}/api/media`, { headers: { Cookie: cookie } });
const mediaPayload = await media.json();
assert(media.status === 200 && Array.isArray(mediaPayload.assets), "Session hợp lệ không đọc được media library.");

const logout = await fetch(`${baseUrl}/api/dashboard/logout`, { method: "POST", headers: { Cookie: cookie } });
assert(logout.status === 200, `Logout phải trả 200, thực tế ${logout.status}.`);

console.log("DASHBOARD_AUTH_REGRESSION_PASS login-route noindex invalid-login login session dashboard tabs media logout");
