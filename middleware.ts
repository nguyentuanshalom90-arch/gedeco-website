import { NextRequest, NextResponse } from "next/server";

const canonicalHost = "gedeco.vn";

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const forwardedProto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const hostHeader = request.headers.get("host")?.toLowerCase() || "";
  const host = hostHeader.split(":")[0];
  const isLocalPreview = hostHeader.startsWith("localhost") || hostHeader.startsWith("127.0.0.1") || hostHeader.startsWith("[::1]");

  if (isLocalPreview) return NextResponse.next();

  if (host !== canonicalHost || forwardedProto !== "https") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = canonicalHost;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.well-known).*)"],
};
