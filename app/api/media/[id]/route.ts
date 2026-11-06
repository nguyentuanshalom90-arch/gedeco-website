import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { containedMediaPath } from "@/lib/media-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(containedMediaPath(asset.optimizedFile));
    if (!data.length) return new Response("Not found", { status: 404 });
    return new Response(data, { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
