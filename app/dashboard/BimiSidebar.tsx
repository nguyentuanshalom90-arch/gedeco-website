"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/vimigo-icon";
import type { DashboardTab } from "./dashboard-tabs";
import {
  ROLE_DEFINITIONS,
  isTabAllowedForRole,
  type AdminRole,
} from "@/lib/dashboard/roles";

type CurrentUserSession = {
  username: string;
  displayName: string;
  role: AdminRole;
};

type BimiSidebarProps = {
  tab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onLogout: () => void;
  currentUser?: CurrentUserSession | null;
};

const allNavItems: Array<{ id: DashboardTab; label: string; icon: string }> = [
  { id: "overview", label: "Tổng quan", icon: "home" },
  { id: "posts", label: "Quản lý bài viết", icon: "feather" },
  { id: "products", label: "Quản lý sản phẩm", icon: "box" },
  { id: "pages", label: "Quản lý page song ngữ", icon: "layers" },
  { id: "content", label: "Quản lý body", icon: "layers" },
  { id: "chrome", label: "Quản lý header & footer", icon: "grid" },
  { id: "media", label: "Thư viện media", icon: "image" },
  { id: "payment", label: "Thanh toán", icon: "creditCard" },
  { id: "shipping", label: "Vận chuyển", icon: "truck" },
  { id: "admins", label: "Quản lý admin", icon: "shield" },
];

export function BimiSidebar({
  tab,
  onSelectTab,
  onLogout,
  currentUser,
}: BimiSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = currentUser?.role || "SUPER_ADMIN";
  const roleDef = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.SUPER_ADMIN;

  const visibleNavItems = allNavItems.filter((item) =>
    isTabAllowedForRole(role, item.id),
  );

  return (
    <aside
      className={`lw-side dashboard-sidebar${mobileOpen ? " mobile-open" : ""}`}
      style={{
        width: 300,
        flex: "0 0 300px",
        borderRight: "1px solid var(--line)",
        padding: "22px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "0 4px" }}>
        <a
          className="logo"
          href="https://vimigo.vn/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mở website Vimigo.vn trong tab mới"
        >
          <Image
            className="logo-image"
            src="/bimi-panel/dashboard-logo.webp"
            alt="Vimigo.vn"
            width={616}
            height={154}
            unoptimized
          />
        </a>
      </div>
      <button
        type="button"
        className="mobile-sidebar-toggle"
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Đóng menu quản trị" : "Mở menu quản trị"}
        onClick={() => setMobileOpen((current) => !current)}
      >
        <Icon name={mobileOpen ? "close" : "grid"} size={18} />
        {mobileOpen ? "Đóng menu" : "Menu quản trị"}
      </button>
      <div
        className="panel brand-card"
        style={{
          padding: 12,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            overflow: "hidden",
            flex: "0 0 48px",
            display: "grid",
            placeItems: "center",
            background: "#fff4f4",
          }}
        >
          <Image
            src="/assets/logo-new.optimized.webp"
            alt="GEDECO"
            width={1317}
            height={1194}
            unoptimized
            style={{ width: "92%", height: "92%", objectFit: "contain" }}
          />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.15 }}>
            GEDECO
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--ink-mute)",
              lineHeight: 1.15,
            }}
          >
            gedeco.vn
          </div>
        </div>
        <Link
          className="btn btn-secondary brand-card-site-link"
          href="/"
          aria-label="Xem website"
        >
          <Icon name="external" size={14} />
          <span>Xem</span>
        </Link>
      </div>

      {/* User Info & Role Badge in Sidebar */}
      {currentUser && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 10,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0, flexShrink: 1 }}>
            <div
              style={{
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={`@${currentUser.username}`}
            >
              @{currentUser.username}
            </div>
          </div>
          <div
            title={`Vai trò: ${roleDef.label}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 9px",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              background: roleDef.badgeSolidBg,
              color: roleDef.badgeColor,
              border: `1px solid ${roleDef.badgeColor}`,
              whiteSpace: "nowrap",
              userSelect: "none",
              lineHeight: 1.2,
              flexShrink: 0,
            }}
          >
            {role === "SUPER_ADMIN" ? "🔒 " : null}
            {roleDef.label}
          </div>
        </div>
      )}

      {/* Navigation Items (Filtered by Role Permissions) */}
      <div
        id="dashboard-navigation"
        className="nav-frame"
        role="navigation"
        aria-label="Các module quản trị"
      >
        <div className="nav-sep" />
        {visibleNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelectTab(item.id);
              setMobileOpen(false);
            }}
            className={`nav-item${tab === item.id ? " active" : ""}`}
            aria-current={tab === item.id ? "page" : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="panel hosting-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--ink-soft)",
              fontWeight: 600,
            }}
          >
            <Icon name="box" size={15} style={{ color: "var(--cy-300)" }} />
            Gói lưu trữ
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span
              className="num"
              style={{ fontSize: 18, color: "var(--cy-300)" }}
            >
              360
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--ink-mute)",
                fontWeight: 600,
              }}
            >
              ngày
            </span>
          </div>
        </div>
        <div className="softbar" style={{ marginTop: 9 }}>
          <i
            style={{
              width: "100%",
              background: "linear-gradient(90deg,var(--cy-400),var(--cy-500))",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
          <span
            style={{
              fontSize: 11.5,
              color: "var(--ink-soft)",
              fontWeight: 800,
              lineHeight: 1.35,
            }}
          >
            Bắt đầu 30/10/2026 · Gia hạn 30/10/2027
          </span>
        </div>
      </div>
      <button
        type="button"
        className="btn lw-logout"
        onClick={onLogout}
        style={{
          justifyContent: "center",
          width: "100%",
          textDecoration: "none",
        }}
      >
        <Icon name="logout" size={16} />
        Đăng xuất
      </button>
    </aside>
  );
}
