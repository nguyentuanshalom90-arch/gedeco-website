/**
 * GET /api/site-content/fields?page=<pageKey>
 *
 * Returns all CMS rows for a page — used by the cms-overlay.js injected
 * into the iframe preview so it can annotate editable elements.
 * Public endpoint (no auth) — only returns id/label/keys/value/image,
 * never any sensitive server data.
 */
import { prisma } from "@/lib/prisma";
import { ensureSiteContentSeeded } from "@/lib/site-content-seeding";
import { optimizedStaticMediaUrl } from "@/lib/static-media";

export async function GET(request: Request) {
  const pageKey = new URL(request.url).searchParams.get("page")?.trim();
  if (!pageKey) {
    return Response.json({ error: "Missing page parameter." }, { status: 400 });
  }

  await ensureSiteContentSeeded();

  const rows = await prisma.siteDynamicContent.findMany({
    where: { pageKey, isVisible: true },
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      kind: true,
      sectionKey: true,
      fieldKey: true,
      label: true,
      value: true,
      contentType: true,
      headingLevel: true,
      imageUrl: true,
      altText: true,
      imageCaption: true,
    },
  });

  const result = rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    sectionKey: row.sectionKey,
    fieldKey: row.fieldKey,
    label: row.label,
    value: row.value ?? "",
    contentType: row.contentType,
    headingLevel: row.headingLevel ?? "",
    imageUrl: row.imageUrl ? optimizedStaticMediaUrl(row.imageUrl) : "",
    altText: row.altText ?? "",
    imageCaption: row.imageCaption ?? "",
  }));

  return Response.json(
    { rows: result },
    { headers: { "Cache-Control": "no-store" } }
  );
}
