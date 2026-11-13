"use client";

import { Icon } from "@/components/vimigo-icon";
import type { DashboardTab } from "./DashboardClient";

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
  { id: "payment", label: "Thanh toán", icon: "creditCard" },
  { id: "shipping", label: "Vận chuyển", icon: "truck" },
];

export function BimiSidebar({ tab, onSelectTab, onLogout }: BimiSidebarProps) {
  return (
    <aside
      className="lw-side dashboard-sidebar"
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
          <img
            className="logo-image"
            src="/bimi-panel/dashboard-logo.webp"
            alt="Vimigo.vn"
          />
        </a>
      </div>
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
          <img
            src="/assets/logo-new.png"
            alt="GEDECO"
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
        <a
          className="btn btn-secondary brand-card-site-link"
          href="/"
          aria-label="Xem website"
        >
          <Icon name="external" size={14} />
          <span>Xem web</span>
        </a>
      </div>
      <div className="nav-frame">
        <div className="nav-sep" />
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`nav-item${tab === item.id ? " active" : ""}`}
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
            Bắt đầu 25/09/2026 · Gia hạn 25/09/2027
          </span>
        </div>
      </div>
      <a
        href="https://zalo.me/0357828707"
        target="_blank"
        rel="noopener noreferrer"
        className="btn"
        style={{
          justifyContent: "center",
          gap: 12,
          width: "100%",
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
          }}
        />
        <span style={{ textAlign: "left", lineHeight: 1.3, fontWeight: 700 }}>
          Nguyễn Tuấn
          <br />
          <span style={{ whiteSpace: "nowrap", fontWeight: 700 }}>
            0357 828 707
          </span>
        </span>
        <img
          src="/bimi-panel/zalo-chat.webp"
          alt="Zalo"
          width={42}
          height={42}
          style={{ flex: "0 0 auto", display: "block", objectFit: "contain" }}
        />
      </a>
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
        <img
          src="/bimi-panel/messenger-copy.webp"
          alt="Messenger"
          width={48.51}
          height={48.51}
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
