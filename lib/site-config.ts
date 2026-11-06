export const siteConfig = {
  brand: "GEDECO",
  officialUrl: process.env.SITE_URL || "https://gedeco.vn",
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
