import { NextResponse } from "next/server";
import { createDashboardSession, DASHBOARD_COOKIE, verifyDashboardCredentials } from "@/lib/dashboard/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  try {
    const result = await verifyDashboardCredentials(username, password);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { error: result.error || "Tên đăng nhập hoặc mật khẩu không đúng." },
        { status: 401 }
      );
    }

    const session = createDashboardSession(result.user);
    const response = NextResponse.json({
      ok: true,
      user: {
        username: result.user.username,
        displayName: result.user.displayName,
        role: result.user.role,
      },
    });

    response.cookies.set(DASHBOARD_COOKIE, session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: session.maxAge,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Dashboard chưa được cấu hình." },
      { status: 503 }
    );
  }
}
