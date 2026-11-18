import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import sharp from "sharp";
import { prisma } from "./prisma-client.mjs";
import { mediaStorageErrorMessage } from "../lib/media-errors.ts";

const projectRoot = process.cwd();
const baseUrl = process.env.MEDIA_TEST_BASE_URL || "http://127.0.0.1:3000";

async function loadEnvFile(filename) {
  try {
    const source = await fs.readFile(path.join(projectRoot, filename), "utf8");
    for (const rawLine of source.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

await loadEnvFile(".env.local");
await loadEnvFile(".env");

const mediaRoot = process.env.MEDIA_ROOT
  ? path.resolve(process.env.MEDIA_ROOT)
  : path.resolve(projectRoot, ".uploads");
const username = process.env.DASHBOARD_USERNAME;
const password = process.env.DASHBOARD_PASSWORD;
assert(username && password, "Thiếu DASHBOARD_USERNAME hoặc DASHBOARD_PASSWORD cho media regression.");

const createdIds = [];
const createdPaths = new Set();

async function loginCookie() {
  const response = await fetch(`${baseUrl}/api/dashboard/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  assert.equal(response.status, 200, `Đăng nhập dashboard thất bại: ${response.status}`);
  const setCookie = response.headers.get("set-cookie") || "";
  const cookie = setCookie.split(";")[0];
  assert(cookie.includes("="), "Không nhận được session cookie.");
  return cookie;
}

async function upload(cookie, fixture) {
  const body = new FormData();
  body.append("file", new File([fixture.buffer], fixture.name, { type: fixture.mime }));
  body.append("altText", fixture.alt);
  body.append("caption", fixture.caption);
  const response = await fetch(`${baseUrl}/api/media`, { method: "POST", headers: { Cookie: cookie }, body });
  const payload = await response.json().catch(() => ({}));
  assert.equal(response.status, 200, `Upload ${fixture.name} thất bại: ${response.status} ${payload.error || ""}`);
  createdIds.push(payload.id);
  return payload;
}

async function verifyAsset(cookie, uploaded, fixture) {
  const row = await prisma.mediaAsset.findUnique({ where: { id: uploaded.id } });
  assert(row, `Media ${uploaded.id} chưa được đăng ký trong database.`);
  const originalPath = path.resolve(mediaRoot, row.originalFile);
  const optimizedPath = path.resolve(mediaRoot, row.optimizedFile);
  createdPaths.add(originalPath);
  createdPaths.add(optimizedPath);
  const [original, optimized] = await Promise.all([fs.readFile(originalPath), fs.readFile(optimizedPath)]);
  assert(original.length > 0, "File gốc rỗng.");
  assert(optimized.length > 0, "WebP derivative rỗng.");
  const [originalMeta, optimizedMeta] = await Promise.all([sharp(original).metadata(), sharp(optimized).metadata()]);
  assert.equal(originalMeta.format, fixture.format);
  assert.equal(optimizedMeta.format, "webp");
  assert(optimizedMeta.width && optimizedMeta.height, "WebP derivative thiếu kích thước.");
  if (fixture.alpha) assert(optimizedMeta.hasAlpha, "WebP derivative làm mất alpha channel.");

  const patchResponse = await fetch(`${baseUrl}/api/media/${row.id}`, {
    method: "PATCH",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ altText: `${fixture.alt} updated`, caption: `${fixture.caption} updated` }),
  });
  assert.equal(patchResponse.status, 200, "PATCH alt/caption thất bại.");
  const updated = await prisma.mediaAsset.findUnique({ where: { id: row.id } });
  assert.equal(updated?.altText, `${fixture.alt} updated`);
  assert.equal(updated?.caption, `${fixture.caption} updated`);

  const backup = Buffer.from(optimized);
  try {
    await fs.writeFile(optimizedPath, Buffer.alloc(0));
    const zeroResponse = await fetch(`${baseUrl}/api/media/${row.id}`, { cache: "no-store" });
    assert.equal(zeroResponse.status, 200, "Derivative 0 byte không fallback về file gốc.");
    assert.equal(zeroResponse.headers.get("content-type"), row.mime);
    assert.deepEqual(Buffer.from(await zeroResponse.arrayBuffer()), original);
  } finally {
    await fs.writeFile(optimizedPath, backup);
  }

  const missingPath = `${optimizedPath}.qa-missing`;
  try {
    await fs.rename(optimizedPath, missingPath);
    const missingResponse = await fetch(`${baseUrl}/api/media/${row.id}`, { cache: "no-store" });
    assert.equal(missingResponse.status, 200, "Derivative ENOENT không fallback về file gốc.");
    assert.equal(missingResponse.headers.get("content-type"), row.mime);
  } finally {
    await fs.rename(missingPath, optimizedPath).catch(() => undefined);
  }
}

try {
  const cookie = await loginCookie();
  const fixtures = [
    { name: "qa-alpha.png", mime: "image/png", format: "png", alpha: true, alt: "QA PNG alpha", caption: "QA PNG caption", buffer: await sharp({ create: { width: 32, height: 24, channels: 4, background: { r: 20, g: 100, b: 180, alpha: 0.45 } } }).png().toBuffer() },
    { name: "qa-photo.jpg", mime: "image/jpeg", format: "jpeg", alpha: false, alt: "QA JPEG", caption: "QA JPEG caption", buffer: await sharp({ create: { width: 40, height: 30, channels: 3, background: { r: 220, g: 160, b: 40 } } }).jpeg().toBuffer() },
    { name: "qa-source.webp", mime: "image/webp", format: "webp", alpha: false, alt: "QA WebP", caption: "QA WebP caption", buffer: await sharp({ create: { width: 36, height: 28, channels: 3, background: { r: 70, g: 150, b: 90 } } }).webp().toBuffer() },
  ];

  for (const fixture of fixtures) {
    const uploaded = await upload(cookie, fixture);
    await verifyAsset(cookie, uploaded, fixture);
  }

  const archivedId = createdIds[0];
  const archiveResponse = await fetch(`${baseUrl}/api/media/${archivedId}`, { method: "DELETE", headers: { Cookie: cookie } });
  assert.equal(archiveResponse.status, 200, "DELETE media thất bại.");
  const archived = await prisma.mediaAsset.findUnique({ where: { id: archivedId } });
  assert(archived?.archivedAt, "DELETE media phải lưu archivedAt thay vì xóa vật lý.");
  const libraryAfterArchive = await fetch(`${baseUrl}/api/media`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert(!libraryAfterArchive.assets?.some((asset) => asset.id === archivedId), "Media đã ẩn vẫn xuất hiện trong thư viện.");
  const archivedUrl = await fetch(`${baseUrl}/api/media/${archivedId}`);
  assert.equal(archivedUrl.status, 200, "URL media cũ phải tiếp tục hoạt động sau soft-delete.");

  const fakeBody = new FormData();
  fakeBody.append("file", new File([Buffer.from("not-an-image")], "qa-fake.png", { type: "image/png" }));
  const fakeResponse = await fetch(`${baseUrl}/api/media`, { method: "POST", headers: { Cookie: cookie }, body: fakeBody });
  assert.equal(fakeResponse.status, 422, `MIME giả phải bị từ chối, nhận ${fakeResponse.status}.`);
  assert.match(mediaStorageErrorMessage(Object.assign(new Error("private path"), { code: "EACCES" })), /quyền ghi/);
  assert.match(mediaStorageErrorMessage(Object.assign(new Error("private path"), { code: "ENOENT" })), /không tồn tại/);
  assert.match(mediaStorageErrorMessage(Object.assign(new Error("private path"), { code: "ENOSPC" })), /Dung lượng/);
  assert.match(mediaStorageErrorMessage(Object.assign(new Error("private path"), { code: "EDQUOT" })), /quota/);
  assert(!mediaStorageErrorMessage(new Error("C:\\secret\\uploads")).includes("secret"), "Thông báo lỗi không được lộ đường dẫn storage.");
  console.log("MEDIA_REGRESSION_PASS png jpeg webp alpha fake-mime zero-byte enoent eacces enospc edquot metadata soft-delete");
} finally {
  if (createdIds.length) await prisma.mediaAsset.deleteMany({ where: { id: { in: createdIds } } });
  await Promise.allSettled([...createdPaths].map((filename) => fs.unlink(filename)));
  await prisma.$disconnect();
}
