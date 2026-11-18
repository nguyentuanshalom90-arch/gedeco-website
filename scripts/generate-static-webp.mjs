import { readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, "public");
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

const originals = (await walk(publicRoot)).filter((filename) => rasterExtensions.has(path.extname(filename).toLowerCase()) && !filename.endsWith(".optimized.webp"));
let generated = 0;
for (const original of originals) {
  const derivative = `${original.slice(0, -path.extname(original).length)}.optimized.webp`;
  try {
    const existing = await stat(derivative);
    if (existing.size > 0) continue;
  } catch {
    // Generate missing derivatives below.
  }
  const optimized = await sharp(original).rotate().webp({ quality: 82, alphaQuality: 90 }).toBuffer();
  if (!optimized.length) throw new Error(`Derivative rỗng: ${original}`);
  const temporary = `${derivative}.${process.pid}.tmp`;
  await writeFile(temporary, optimized, { flag: "wx" });
  await rename(temporary, derivative);
  generated += 1;
}

console.log(`STATIC_WEBP_GENERATED originals=${originals.length} generated=${generated}`);
