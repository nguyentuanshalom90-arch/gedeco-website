"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import { BimiSidebar } from "./BimiSidebar";
import { ContentManager } from "./ContentManager";
import { SiteContentManager } from "./SiteContentManager";
import { SiteChromeManager } from "./SiteChromeManager";
import { IntegrationManager } from "./IntegrationManager";
import { ProductContentManager } from "./ProductContentManager";
import { listPosts } from "@/lib/dashboard/post-actions";
import { listIntegrations } from "@/lib/dashboard/integration-actions";
import { SitePageManager } from "./SitePageManager";
import { MediaLibraryManager } from "./MediaLibraryManager";
import { AdminUserManager } from "./AdminUserManager";
import { DASHBOARD_TABS, type DashboardTab } from "./dashboard-tabs";
import {
  isTabAllowedForRole,
  getDefaultTabForRole,
  type AdminRole,
} from "@/lib/dashboard/roles";

export type { DashboardTab } from "./dashboard-tabs";

type CurrentUserSession = {
  username: string;
  displayName: string;
  role: AdminRole;
};

export function DashboardClient({
  initialTab = "overview",
  currentUser,
}: {
  initialTab?: DashboardTab;
  currentUser?: CurrentUserSession | null;
}) {
  const [user, setUser] = useState<CurrentUserSession | null | undefined>(currentUser);
  const role = user?.role || "SUPER_ADMIN";
  const validInitialTab = isTabAllowedForRole(role, initialTab)
    ? initialTab
    : getDefaultTabForRole(role);

  const [tab, setTab] = useState<DashboardTab>(validInitialTab);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    integrations: 0,
  });

  // Đồng bộ quyền hạn theo thời gian thực: khi admin đổi role trong DB,
  // dashboard của user lập tức cập nhật quyền và menu mà không cần logout/refresh.
  useEffect(() => {
    let active = true;

    async function syncLiveRole() {
      try {
        const res = await fetch("/api/dashboard/me", { cache: "no-store" });
        if (!active) return;
        if (res.status === 401) {
          window.location.href = "/vmg-login";
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && data.user) {
          setUser((prev) => {
            if (!prev) return data.user;
            if (prev.role !== data.user.role || prev.displayName !== data.user.displayName) {
              if (!isTabAllowedForRole(data.user.role, tab)) {
                const nextTab = getDefaultTabForRole(data.user.role);
                setTab(nextTab);
                const url = new URL(window.location.href);
                url.searchParams.set("view", "dashboard");
                url.searchParams.set("tab", nextTab);
                window.history.replaceState({}, "", url);
              }
              return data.user;
            }
            return prev;
          });
        }
      } catch {}
    }

    const timer = setInterval(syncLiveRole, 2000);
    window.addEventListener("focus", syncLiveRole);

    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", syncLiveRole);
    };
  }, [tab]);

  useEffect(() => {
    Promise.all([
      listPosts(),
      listIntegrations("PAYMENT"),
      listIntegrations("SHIPPING"),
    ])
      .then(([posts, payment, shipping]) =>
        setStats({
          total: posts.length,
          published: posts.filter((item) => item.status === "PUBLISHED").length,
          draft: posts.filter((item) => item.status !== "PUBLISHED").length,
          integrations: [...payment, ...shipping].filter(
            (item) =>
              item.enabled &&
              !item.provider.endsWith("master") &&
              item.provider !== "shipping-options",
          ).length,
        }),
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    function restoreTab() {
      const next = new URLSearchParams(window.location.search).get("tab") as DashboardTab;
      if (next && DASHBOARD_TABS.includes(next) && isTabAllowedForRole(role, next)) {
        setTab(next);
      } else {
        setTab(getDefaultTabForRole(role));
      }
    }
    window.addEventListener("popstate", restoreTab);
    return () => window.removeEventListener("popstate", restoreTab);
  }, [role]);

  function selectTab(next: DashboardTab) {
    if (!isTabAllowedForRole(role, next)) {
      return;
    }
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("view", "dashboard");
    url.searchParams.set("tab", next);
    window.history.pushState({}, "", url);
  }

  async function logout() {
    await fetch("/api/dashboard/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/vmg-login";
  }

  return (
    <div className={`lw vimigo dashboard-shell ${styles.shell}`}>
      <BimiSidebar
        tab={tab}
        onSelectTab={selectTab}
        onLogout={logout}
        currentUser={user}
      />
      <main
        className={`dashboard-main ${styles.main}`}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {tab === "overview" && (
          <section className={`${styles.content} cms-overview`}>
            <div className="dashboard-view-head">
              <p className="eyebrow">TRUNG TÂM QUẢN TRỊ GEDECO</p>
              <h1 className="disp">Tổng quan</h1>
              <p>Quản lý bài viết, SEO, sản phẩm, nội dung và các tích hợp vận hành của website.</p>
            </div>
            <div className="cms-metric-grid">
              <article className="panel">
                <span>Tổng bài viết</span>
                <strong>{stats.total}</strong>
                <small>Tất cả nội dung trong hệ thống</small>
              </article>
              <article className="panel">
                <span>Đã xuất bản</span>
                <strong>{stats.published}</strong>
                <small>Đang hiển thị trên website</small>
              </article>
              <article className="panel">
                <span>Nháp và lên lịch</span>
                <strong>{stats.draft}</strong>
                <small>Nội dung đang biên tập</small>
              </article>
              <article className="panel">
                <span>Tích hợp đang bật</span>
                <strong>{stats.integrations}</strong>
                <small>Thanh toán và vận chuyển</small>
              </article>
            </div>
            <div className="cms-quick-grid">
              {isTabAllowedForRole(role, "posts") && (
                <button
                  type="button"
                  className="panel"
                  onClick={() => selectTab("posts")}
                >
                  <span>01</span>
                  <strong>Quản lý bài viết</strong>
                  <p>Quản lý danh mục, bài viết, lịch đăng và tối ưu SEO.</p>
                </button>
              )}
              {isTabAllowedForRole(role, "products") && (
                <button
                  type="button"
                  className="panel"
                  onClick={() => selectTab("products")}
                >
                  <span>02</span>
                  <strong>Quản lý sản phẩm</strong>
                  <p>Chỉnh nội dung, danh mục, media, song ngữ và SEO sản phẩm.</p>
                </button>
              )}
              {isTabAllowedForRole(role, "content") && (
                <button
                  type="button"
                  className="panel"
                  onClick={() => selectTab("content")}
                >
                  <span>03</span>
                  <strong>Quản lý body</strong>
                  <p>Quản lý body theo page, nội dung động, nội dung tĩnh và metadata SEO.</p>
                </button>
              )}
              {isTabAllowedForRole(role, "chrome") && (
                <button
                  type="button"
                  className="panel"
                  onClick={() => selectTab("chrome")}
                >
                  <span>04</span>
                  <strong>Quản lý header &amp; footer</strong>
                  <p>Quản lý header/footer, menu, liên hệ và bản quyền dùng chung.</p>
                </button>
              )}
              {isTabAllowedForRole(role, "pages") && (
                <button
                  type="button"
                  className="panel"
                  onClick={() => selectTab("pages")}
                >
                  <span>05</span>
                  <strong>Quản lý page</strong>
                  <p>Soạn section, bản dịch và metadata cho các page trong menu.</p>
                </button>
              )}
              {isTabAllowedForRole(role, "media") && (
                <button
                  type="button"
                  className="panel"
                  onClick={() => selectTab("media")}
                >
                  <span>06</span>
                  <strong>Thư viện media</strong>
                  <p>Tìm ảnh, tải lên và quản lý alt text/caption dùng toàn website.</p>
                </button>
              )}
              {isTabAllowedForRole(role, "payment") && (
                <button
                  type="button"
                  className="panel"
                  onClick={() => selectTab("payment")}
                >
                  <span>07</span>
                  <strong>Cấu hình thanh toán</strong>
                  <p>Bật cổng thanh toán và thiết lập đối soát.</p>
                </button>
              )}
              {isTabAllowedForRole(role, "shipping") && (
                <button
                  type="button"
                  className="panel"
                  onClick={() => selectTab("shipping")}
                >
                  <span>08</span>
                  <strong>Cấu hình vận chuyển</strong>
                  <p>Chọn đơn vị giao hàng và các tính năng vận chuyển.</p>
                </button>
              )}
              {isTabAllowedForRole(role, "admins") && (
                <button
                  type="button"
                  className="panel"
                  onClick={() => selectTab("admins")}
                  style={{ borderLeft: "3px solid #2563eb" }}
                >
                  <span style={{ color: "#2563eb" }}>09</span>
                  <strong style={{ color: "#2563eb" }}>Quản lý admin &amp; Phân quyền</strong>
                  <p>Tạo tài khoản, phân quyền 5 cấp vai trò, đổi mật khẩu và bảo mật.</p>
                </button>
              )}
            </div>
          </section>
        )}
        {tab === "posts" && (
          <section className={styles.content}>
            <ContentManager />
          </section>
        )}
        {tab === "products" && (
          <section className={styles.content}>
            <ProductContentManager />
          </section>
        )}
        {tab === "pages" && (
          <section className={styles.content}>
            <SitePageManager />
          </section>
        )}
        {tab === "content" && (
          <section className={styles.content}>
            <SiteContentManager />
          </section>
        )}
        {tab === "chrome" && (
          <section className={styles.content}>
            <SiteChromeManager />
          </section>
        )}
        {tab === "media" && (
          <section className={styles.content}>
            <MediaLibraryManager />
          </section>
        )}
        {tab === "payment" && (
          <section className={styles.content}>
            <IntegrationManager category="PAYMENT" />
          </section>
        )}
        {tab === "shipping" && (
          <section className={styles.content}>
            <IntegrationManager category="SHIPPING" />
          </section>
        )}
        {tab === "admins" && (
          <section className={styles.content}>
            <AdminUserManager currentUsername={user?.username} />
          </section>
        )}
      </main>
    </div>
  );
}
