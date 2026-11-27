export const DASHBOARD_TABS = [
  "overview",
  "posts",
  "products",
  "site-content",
  "payment",
  "shipping",
  "admins",
] as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[number];
