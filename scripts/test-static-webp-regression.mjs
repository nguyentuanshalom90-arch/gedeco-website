import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const publicRoot = path.join(process.cwd(), "public");
const rasterExtensions = new Set([".png", ".jpg", ".jpeg"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

const originals = (await walk(publicRoot)).filter((filename) => rasterExtensions.has(path.extname(filename).toLowerCase()));
for (const original of originals) {
  const originalSize = (await stat(original)).size;
  if (!originalSize) throw new Error(`File gốc rỗng: ${original}`);
  const extension = path.extname(original);
  const derivative = `${original.slice(0, -extension.length)}.optimized.webp`;
  const derivativeSize = (await stat(derivative)).size;
  if (!derivativeSize) throw new Error(`WebP derivative rỗng: ${derivative}`);
}

console.log(`STATIC_WEBP_REGRESSION_PASS assets=${originals.length}`);
