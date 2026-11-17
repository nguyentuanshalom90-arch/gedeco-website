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
] as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[number];
