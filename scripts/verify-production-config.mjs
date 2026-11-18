import path from "node:path";

const failures = [];
const projectRoot = path.resolve(process.cwd());

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) failures.push(`${name} chưa được khai báo.`);
  return value || "";
}

if (process.env.NODE_ENV !== "production") {
  failures.push("NODE_ENV phải là production khi chạy gate production.");
}

const siteUrl = required("SITE_URL");
if (siteUrl) {
  try {
    const parsed = new URL(siteUrl);
    if (parsed.protocol !== "https:" || parsed.hostname !== "gedeco.vn" || parsed.username || parsed.password || parsed.port || parsed.pathname !== "/" || parsed.search || parsed.hash) {
      failures.push("SITE_URL phải chính xác là https://gedeco.vn/.");
    }
  } catch {
    failures.push("SITE_URL không phải URL hợp lệ.");
  }
}

const mediaRoot = required("MEDIA_ROOT");
if (mediaRoot) {
  if (!path.isAbsolute(mediaRoot)) failures.push("MEDIA_ROOT phải là đường dẫn tuyệt đối.");
  const resolvedMediaRoot = path.resolve(mediaRoot);
  if (resolvedMediaRoot === projectRoot || resolvedMediaRoot.startsWith(`${projectRoot}${path.sep}`)) {
    failures.push("MEDIA_ROOT không được nằm trong release/project root.");
  }
}

const databaseUrl = required("DATABASE_URL");
if (/\b(localhost|127\.0\.0\.1|::1)\b/i.test(databaseUrl)) {
  failures.push("DATABASE_URL production không được trỏ tới database local.");
}

const sessionSecret = required("DASHBOARD_SESSION_SECRET");
if (sessionSecret && sessionSecret.length < 32) failures.push("DASHBOARD_SESSION_SECRET phải có tối thiểu 32 ký tự.");
required("DASHBOARD_USERNAME");
required("DASHBOARD_PASSWORD");

if (failures.length) {
  console.error(`PRODUCTION_CONFIG_FAIL\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("PRODUCTION_CONFIG_PASS official-domain media-root database session-auth");
