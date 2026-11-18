import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp, { type Metadata } from "sharp";
import { prisma } from "@/lib/prisma";
import { containedMediaPath, mediaRoot } from "@/lib/media-storage";
import { mediaStorageErrorMessage } from "@/lib/media-errors";
import { requireDashboardSession } from "@/lib/dashboard/auth";

export const runtime = "nodejs";
const MAX_BYTES = 8 * 1024 * 1024;
const allowedFormats = new Map([["jpeg", "jpg"], ["png", "png"], ["webp", "webp"]]);

export async function GET() {
  try {
    await requireDashboardSession();
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Chưa đăng nhập." }, { status: 401 });
  }
  const assets = await prisma.mediaAsset.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" }, take: 100 });
  return Response.json({
    assets: assets.map((asset) => ({ id: asset.id, name: asset.originalName, url: `/api/media/${asset.id}`, width: asset.width, height: asset.height, altText: asset.altText, caption: asset.caption })),
  });
}

export async function POST(request: Request) {
  try {
    await requireDashboardSession();
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Chưa đăng nhập." }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  const altText = typeof form.get("altText") === "string" ? String(form.get("altText")).trim().slice(0, 300) : "";
  const caption = typeof form.get("caption") === "string" ? String(form.get("caption")).trim().slice(0, 500) : "";
  if (!(file instanceof File)) return Response.json({ error: "Không tìm thấy file." }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_BYTES) return Response.json({ error: "Ảnh phải nhỏ hơn 8 MB." }, { status: 413 });

  const input = Buffer.from(await file.arrayBuffer());
  let metadata: Metadata;
  try {
    metadata = await sharp(input).metadata();
  } catch {
    return Response.json({ error: "File không phải ảnh hợp lệ." }, { status: 422 });
  }
  const extension = metadata.format ? allowedFormats.get(metadata.format) : undefined;
  if (!extension || !metadata.width || !metadata.height) return Response.json({ error: "Chỉ hỗ trợ PNG, JPG hoặc WebP." }, { status: 415 });

  const id = randomUUID();
  const originalFile = `${id}.original.${extension}`;
  const optimizedFile = `${id}.optimized.webp`;
  const originalTmp = `${originalFile}.tmp`;
  const optimizedTmp = `${optimizedFile}.tmp`;
  await mkdir(mediaRoot(), { recursive: true });

  try {
    await writeFile(containedMediaPath(originalTmp), input, { flag: "wx" });
    await rename(containedMediaPath(originalTmp), containedMediaPath(originalFile));
    const optimized = await sharp(input).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }).toBuffer({ resolveWithObject: true });
    if (!optimized.data.length || !optimized.info.width || !optimized.info.height) throw new Error("Ảnh WebP tối ưu không hợp lệ.");
    await writeFile(containedMediaPath(optimizedTmp), optimized.data, { flag: "wx" });
    await rename(containedMediaPath(optimizedTmp), containedMediaPath(optimizedFile));
    const asset = await prisma.mediaAsset.create({
      data: {
        id,
        originalName: file.name || `image.${extension}`,
        originalFile,
        optimizedFile,
        mime: `image/${metadata.format === "jpeg" ? "jpeg" : metadata.format}`,
        width: optimized.info.width,
        height: optimized.info.height,
        sizeBytes: input.length,
        altText,
        caption,
      },
    });
    return Response.json({ id: asset.id, name: asset.originalName, url: `/api/media/${asset.id}`, width: asset.width, height: asset.height, altText: asset.altText, caption: asset.caption });
  } catch (error) {
    await Promise.allSettled([
      unlink(containedMediaPath(originalTmp)),
      unlink(containedMediaPath(optimizedTmp)),
      unlink(containedMediaPath(originalFile)),
      unlink(containedMediaPath(optimizedFile)),
    ]);
    return Response.json({ error: mediaStorageErrorMessage(error) }, { status: 500 });
  }
}
