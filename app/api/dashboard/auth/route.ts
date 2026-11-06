import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Đăng nhập production chưa được cấu hình." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const expectedUsername = process.env.DASHBOARD_USERNAME || "admin";
  const expectedPassword = process.env.DASHBOARD_PASSWORD || "Gedeco@2025!";

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không đúng." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
