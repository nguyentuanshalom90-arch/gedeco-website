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
  const response = NextResponse.redirect(new URL(safePath, request.url));
  // Keep the redirect same-origin. The reverse proxy may expose an internal
  // request origin such as localhost:3010 to Next.js, which must never leak
  // into the browser's Location header.
  response.headers.set("Location", safePath);
  response.cookies.set(DASHBOARD_COOKIE, session.value, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });

  return response;
}
