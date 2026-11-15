import { NextRequest, NextResponse } from "next/server";

const canonicalHost = "gedeco.vn";

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const forwardedProto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();

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
