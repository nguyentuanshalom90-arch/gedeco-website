import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { containedMediaPath } from "@/lib/media-storage";
import { requireDashboardSession } from "@/lib/dashboard/auth";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(containedMediaPath(asset.optimizedFile));
    if (!data.length) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(data), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    try {
      const original = await readFile(containedMediaPath(asset.originalFile));
      if (!original.length) return new Response("Not found", { status: 404 });
      return new Response(new Uint8Array(original), { headers: { "Content-Type": asset.mime, "Cache-Control": "public, max-age=3600" } });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireDashboardSession();
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Chưa đăng nhập." }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const altText = typeof body.altText === "string" ? body.altText.trim().slice(0, 300) : "";
  const caption = typeof body.caption === "string" ? body.caption.trim().slice(0, 500) : "";
  try {
    const asset = await prisma.mediaAsset.update({ where: { id }, data: { altText, caption } });
    return Response.json({ id: asset.id, name: asset.originalName, url: `/api/media/${asset.id}`, width: asset.width, height: asset.height, altText: asset.altText, caption: asset.caption });
  } catch {
    return Response.json({ error: "Không tìm thấy media." }, { status: 404 });
  }
}
