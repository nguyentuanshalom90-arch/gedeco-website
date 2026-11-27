import { NextRequest, NextResponse } from "next/server";

const canonicalHost = "gedeco.vn";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  for (const header of ["host", "origin", "referer", "x-forwarded-host", "x-forwarded-proto", "x-forwarded-port"]) {
    const value = requestHeaders.get(header);
    if (value?.includes(",")) requestHeaders.set(header, value.split(",", 1)[0].trim());
  }
  requestHeaders.set("x-gedeco-language", request.nextUrl.pathname === "/en" || request.nextUrl.pathname.startsWith("/en/") ? "en" : "vi");
  // Propagate CMS preview mode as a server header so layout.tsx can inject the overlay script.
  if (request.nextUrl.searchParams.get("cmsPreview") === "1") {
    requestHeaders.set("x-cms-preview", "1");
  }
  const continueRequest = () => NextResponse.next({ request: { headers: requestHeaders } });

  if (process.env.NODE_ENV !== "production") return continueRequest();

  const forwardedProto = requestHeaders.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const hostHeader = (requestHeaders.get("host") || "").toLowerCase();
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
