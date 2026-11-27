import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDashboardSession, DASHBOARD_COOKIE } from "@/lib/dashboard/auth";
import type { AdminRole } from "@/lib/dashboard/roles";
import { runtimeEnv } from "@/lib/runtime-env";

function dashboardUrl(path: string, request: Request) {
  const baseUrl = runtimeEnv("SITE_URL") || new URL(request.url).origin;
  const safePath = path.startsWith("/") ? path : "/dashboard";
  return new URL(safePath, baseUrl);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("user")?.trim() || "";

  if (!username) {
    return NextResponse.redirect(dashboardUrl("/vmg-login", request));
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
  const response = NextResponse.redirect(dashboardUrl(redirectTo, request));
  response.cookies.set(DASHBOARD_COOKIE, session.value, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });

  return response;
}
