import type { DashboardTab } from "@/app/dashboard/dashboard-tabs";

export type AdminRole =
  | "SUPER_ADMIN"
  | "WEBSITE_MANAGER"
  | "CONTENT_MANAGER"
  | "PRODUCT_MANAGER"
  | "POST_MANAGER";

export type RoleDefinition = {
  key: AdminRole;
  label: string;
  badgeText: string;
  badgeBg: string;
  badgeSolidBg: string;
  badgeColor: string;
  description: string;
  detailedPermissions: string[];
  allowedTabs: readonly DashboardTab[];
  defaultTab: DashboardTab;
};

export const ROLE_DEFINITIONS: Record<AdminRole, RoleDefinition> = {
  SUPER_ADMIN: {
    key: "SUPER_ADMIN",
    label: "Admin cao nhất",
    badgeText: "Admin cao nhất",
    badgeBg: "rgba(225, 29, 72, 0.12)",
    badgeSolidBg: "#fff1f2",
    badgeColor: "#e11d48",
    description: "Có quyền cao nhất, toàn quyền trên website, có quyền tạo tài khoản và phân quyền, có khả năng tự đổi mật khẩu bằng reset pass qua email.",
    detailedPermissions: [
      "Toàn quyền quản trị hệ thống và tất cả các module",
      "Tạo, sửa, đổi vai trò, khóa và xóa tài khoản quản trị viên",
      "Phân quyền cho các cấp quản trị khác",
      "Tự đổi mật khẩu và đặt lại mật khẩu an toàn qua email",
    ],
    allowedTabs: [
      "overview",
      "posts",
      "products",
      "site-content",
      "payment",
      "shipping",
      "admins",
    ],
    defaultTab: "overview",
  },
  WEBSITE_MANAGER: {
    key: "WEBSITE_MANAGER",
    label: "Quản lý website",
    badgeText: "Quản lý website",
    badgeBg: "rgba(37, 99, 235, 0.12)",
    badgeSolidBg: "#eff6ff",
    badgeColor: "#2563eb",
    description: "Có toàn quyền thao tác trong các module nội dung và cấu hình website, không có quyền tạo tài khoản và phân quyền.",
    detailedPermissions: [
      "Toàn quyền quản lý bài viết và danh mục bài viết",
      "Toàn quyền quản lý sản phẩm và danh mục sản phẩm",
      "Toàn quyền thao tác trong module Quản lý page và thư viện media",
      "Không có quyền truy cập module Quản lý admin và phân quyền",
    ],
    allowedTabs: [
      "overview",
      "posts",
      "products",
      "site-content",
      "payment",
      "shipping",
    ],
    defaultTab: "overview",
  },
  CONTENT_MANAGER: {
    key: "CONTENT_MANAGER",
    label: "Quản lý page",
    badgeText: "Quản lý page",
    badgeBg: "rgba(5, 150, 105, 0.12)",
    badgeSolidBg: "#ecfdf5",
    badgeColor: "#059669",
    description: "Chỉ được quyền và có toàn quyền trong module Quản lý page.",
    detailedPermissions: [
      "Chỉ được quyền và có toàn quyền trong module Quản lý page",
      "Toàn quyền chỉnh sửa Body các page (Trang chủ, Giới thiệu, Liên hệ...)",
      "Không được truy cập Quản lý bài viết, Sản phẩm, Thanh toán, Vận chuyển hoặc Quản trị viên",
    ],
    allowedTabs: ["site-content"],
    defaultTab: "site-content",
  },
  PRODUCT_MANAGER: {
    key: "PRODUCT_MANAGER",
    label: "Quản lý sản phẩm",
    badgeText: "Quản lý sản phẩm",
    badgeBg: "rgba(217, 119, 6, 0.12)",
    badgeSolidBg: "#fffbeb",
    badgeColor: "#d97706",
    description: "Chỉ được quyền và có toàn quyền thao tác trong module Quản lý sản phẩm.",
    detailedPermissions: [
      "Toàn quyền tạo, sửa, xóa, ẩn/hiện sản phẩm",
      "Quản lý danh mục sản phẩm song ngữ và SEO",
      "Không được truy cập Bài viết, Quản lý page, Cấu hình hoặc Quản trị viên",
    ],
    allowedTabs: ["products"],
    defaultTab: "products",
  },
  POST_MANAGER: {
    key: "POST_MANAGER",
    label: "Quản lý bài viết",
    badgeText: "Quản lý bài viết",
    badgeBg: "rgba(8, 145, 178, 0.12)",
    badgeSolidBg: "#ecfeff",
    badgeColor: "#0891b2",
    description: "Chỉ được quyền và có toàn quyền thao tác trong module Quản lý bài viết.",
    detailedPermissions: [
      "Toàn quyền tạo, sửa, xóa, lên lịch, xuất bản bài viết",
      "Quản lý danh mục bài viết song ngữ và tối ưu SEO",
      "Không được truy cập Sản phẩm, Quản lý page, Cấu hình hoặc Quản trị viên",
    ],
    allowedTabs: ["posts"],
    defaultTab: "posts",
  },
};

export const ADMIN_ROLES_LIST: AdminRole[] = [
  "SUPER_ADMIN",
  "WEBSITE_MANAGER",
  "CONTENT_MANAGER",
  "PRODUCT_MANAGER",
  "POST_MANAGER",
];

export function isTabAllowedForRole(role: AdminRole, tab: DashboardTab): boolean {
  const definition = ROLE_DEFINITIONS[role];
  if (!definition) return false;
  return definition.allowedTabs.includes(tab);
}

export function getDefaultTabForRole(role: AdminRole): DashboardTab {
  return ROLE_DEFINITIONS[role]?.defaultTab || "overview";
}

export function assertRole(session: { role: AdminRole }, allowedRoles: AdminRole[]) {
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`Bạn không có quyền thực hiện thao tác này (yêu cầu vai trò: ${allowedRoles.map((r) => ROLE_DEFINITIONS[r]?.label || r).join(", ")}).`);
  }
}
