import { NextResponse } from "next/server";
import { getDashboardSession } from "@/lib/dashboard/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getDashboardSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      username: session.username,
      displayName: session.displayName,
      role: session.role,
    },
  });
}
