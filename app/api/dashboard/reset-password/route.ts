import { type NextRequest, NextResponse } from "next/server";
import { requestPasswordReset, resetPasswordWithToken } from "@/lib/dashboard/admin-actions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "request") {
      const { identifier } = body;
      if (!identifier) {
        return NextResponse.json({ ok: false, message: "Vui lòng nhập tên đăng nhập hoặc email." }, { status: 400 });
      }
      const origin = req.headers.get("origin") || req.headers.get("referer") || undefined;
      const result = await requestPasswordReset(identifier, origin);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    if (action === "reset") {
      const { token, newPassword } = body;
      if (!token || !newPassword) {
        return NextResponse.json({ ok: false, error: "Thiếu token hoặc mật khẩu mới." }, { status: 400 });
      }
      const result = await resetPasswordWithToken(token, newPassword);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    return NextResponse.json({ ok: false, error: "Action không hợp lệ." }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Lỗi server." },
      { status: 500 }
    );
  }
}
