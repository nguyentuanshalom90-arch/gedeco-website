import { NextRequest, NextResponse } from "next/server";

const canonicalHost = "gedeco.vn";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-gedeco-language", request.nextUrl.pathname === "/en" || request.nextUrl.pathname.startsWith("/en/") ? "en" : "vi");
  const continueRequest = () => NextResponse.next({ request: { headers: requestHeaders } });

  if (process.env.NODE_ENV !== "production") return continueRequest();

  const forwardedProto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const hostHeader = request.headers.get("host")?.toLowerCase() || "";
  const host = hostHeader.split(":")[0];
  const isLocalPreview = hostHeader.startsWith("localhost") || hostHeader.startsWith("127.0.0.1") || hostHeader.startsWith("[::1]");

  if (isLocalPreview) return continueRequest();

  if (host !== canonicalHost || forwardedProto !== "https") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = canonicalHost;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return continueRequest();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.well-known).*)"],
};
