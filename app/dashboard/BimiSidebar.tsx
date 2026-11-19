"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/vimigo-icon";
import type { DashboardTab } from "./dashboard-tabs";

type BimiSidebarProps = {
  tab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onLogout: () => void;
};
const navItems: Array<{ id: DashboardTab; label: string; icon: string }> = [
  { id: "overview", label: "Tổng quan", icon: "home" },
  { id: "posts", label: "Quản lý bài viết", icon: "feather" },
  { id: "products", label: "Quản lý sản phẩm", icon: "box" },
  { id: "pages", label: "Quản lý page song ngữ", icon: "layers" },
  { id: "content", label: "Quản lý body", icon: "layers" },
  { id: "chrome", label: "Quản lý header & footer", icon: "grid" },
  { id: "media", label: "Thư viện media", icon: "image" },
  { id: "payment", label: "Thanh toán", icon: "creditCard" },
  { id: "shipping", label: "Vận chuyển", icon: "truck" },
];

export function BimiSidebar({ tab, onSelectTab, onLogout }: BimiSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
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
      <div id="dashboard-navigation" className="nav-frame" role="navigation" aria-label="Các module quản trị">
        <div className="nav-sep" />
        {navItems.map((item) => (
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
      <a
        href="https://www.facebook.com/nguyentuan.vimigo.90"
        target="_blank"
        rel="noopener noreferrer"
        className="btn"
        style={{
          justifyContent: "center",
          gap: 12,
          width: "100%",
          height: 62,
          boxSizing: "border-box",
          padding: "0 12px",
          textDecoration: "none",
          background: "#ffffff",
          color: "#111111",
          fontWeight: 700,
          border: "1px solid rgba(4,56,38,0.10)",
          boxShadow: "0 4px 14px rgba(3,58,39,0.14)",
        }}
      >
        <Icon
          name="arrowCircle"
          size={32}
          style={{
            flex: "0 0 auto",
            width: 32,
            height: 32,
            animation: "lwArrowFloat 1.15s ease-in-out infinite",
            animationDelay: "0.575s",
          }}
        />
        <span style={{ textAlign: "left", lineHeight: 1.3, fontWeight: 700 }}>
          Nguyễn Tuấn
        </span>
        <Image
          src="/bimi-panel/messenger-copy.webp"
          alt="Messenger"
          width={440}
          height={440}
          unoptimized
          style={{ flex: "0 0 auto", display: "block", objectFit: "contain" }}
        />
      </a>
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
