export const DASHBOARD_TABS = [
  "overview",
  "posts",
  "products",
  "pages",
  "content",
  "chrome",
  "media",
  "payment",
  "shipping",
  "admins",
] as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[number];
