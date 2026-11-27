import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDashboardSession, DASHBOARD_COOKIE } from "@/lib/dashboard/auth";
import type { AdminRole } from "@/lib/dashboard/roles";

function safeDashboardPath(path: string) {
  return path.startsWith("/") ? path : "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("user")?.trim() || "";

  if (!username) {
    return NextResponse.redirect(new URL("/vmg-login", request.url));
  }

  const dbUser = await prisma.adminUser.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });

  if (!dbUser || !dbUser.isActive) {
    return NextResponse.json({ error: "Tài khoản không tồn tại hoặc đã bị khóa." }, { status: 404 });
  }

  const session = createDashboardSession({
    userId: dbUser.id,
    username: dbUser.username,
    displayName: dbUser.displayName,
    role: dbUser.role as AdminRole,
  });

  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const safePath = safeDashboardPath(redirectTo);
  const scriptPath = JSON.stringify(safePath).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
  const response = new NextResponse(`<!doctype html><meta charset="utf-8"><title>Đang chuyển hướng…</title><script>location.replace(${scriptPath})</script>`, {
    status: 200,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
  response.cookies.set(DASHBOARD_COOKIE, session.value, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });

  return response;
}
