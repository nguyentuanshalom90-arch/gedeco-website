import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard/auth";
import { revalidatePath } from "next/cache";

const englishRoute: Record<string, string> = {
  "/": "/en",
  "/gioi-thieu": "/en/about",
  "/tin-tuc": "/en/news",
  "/san-pham": "/en/products",
  "/lien-he": "/en/contact",
};

export async function POST(request: Request) {
  try {
    await requireDashboardSession();
  } catch {
    return Response.json({ error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pageKey, changes } = body as {
      pageKey: string;
      changes: Array<{
        id: string;
        value?: string;
        imageUrl?: string;
        altText?: string;
        imageCaption?: string;
      }>;
    };

    if (!Array.isArray(changes) || changes.length === 0) {
      return Response.json({ error: "Không có thay đổi nào để lưu." }, { status: 400 });
    }

    const page = await prisma.siteContentPage.findUnique({
      where: { pageKey },
      select: { route: true },
    });

    for (const change of changes) {
      if (!change.id) continue;
      const data: Record<string, unknown> = {};
      if (typeof change.value === "string") data.value = change.value;
      if (typeof change.imageUrl === "string") data.imageUrl = change.imageUrl;
      if (typeof change.altText === "string") data.altText = change.altText;
      if (typeof change.imageCaption === "string") data.imageCaption = change.imageCaption;

      if (Object.keys(data).length > 0) {
        await prisma.siteDynamicContent.update({
          where: { id: change.id },
          data,
        });
      }
    }

    if (page?.route) {
      revalidatePath(page.route);
      if (englishRoute[page.route]) {
        revalidatePath(englishRoute[page.route]);
      }
    }

    return Response.json({ ok: true, savedCount: changes.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi lưu nội dung.";
    return Response.json({ error: message }, { status: 500 });
  }
}
