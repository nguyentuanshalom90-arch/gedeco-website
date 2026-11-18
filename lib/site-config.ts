function resolveOfficialUrl() {
  const configured = process.env.SITE_URL?.trim();
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const isLocalPreview = process.env.LOCAL_PREVIEW === "1";
  if (!configured) {
    if (process.env.NODE_ENV === "production" && !isBuildPhase && !isLocalPreview) {
      throw new Error("SITE_URL phải được inject trong môi trường production.");
    }
    return "https://gedeco.vn";
  }
  try {
    const parsed = new URL(configured);
    if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") {
      throw new Error("SITE_URL production phải dùng HTTPS.");
    }
    if (process.env.NODE_ENV === "production" && !isLocalPreview && (parsed.hostname !== "gedeco.vn" || parsed.username || parsed.password || parsed.port || parsed.pathname !== "/" || parsed.search || parsed.hash)) {
      throw new Error("SITE_URL production phải trỏ chính xác tới https://gedeco.vn/.");
    }
    return configured.replace(/\/$/, "");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("SITE_URL")) throw error;
    throw new Error("SITE_URL không phải URL hợp lệ.");
  }
}

export const siteConfig = {
  brand: "GEDECO",
  officialUrl: resolveOfficialUrl(),
  defaultTitle: "GEDECO | Thương mại và xuất khẩu",
  defaultDescription: "GEDECO phát triển nguồn hàng Việt Nam và kết nối sản phẩm chất lượng với khách hàng, đối tác trong nước và quốc tế.",
  locale: "vi_VN",
  logo: "/assets/logo-new.png",
  email: "info@gedeco.vn",
  phone: "0914943653",
  address:
    "Tầng số 14 Tòa nhà Đa năng, số 169 Nguyễn Ngọc Vũ, P. Yên Hòa, TP. Hà Nội, Việt Nam",
} as const;

export function absoluteUrl(path: string) {
  if (/^https:\/\//i.test(path)) return path;
  return new URL(
    path.startsWith("/") ? path : `/${path}`,
    siteConfig.officialUrl,
  ).toString();
}
