"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import { BimiSidebar } from "./BimiSidebar";
import { ContentManager } from "./ContentManager";
import { SiteContentManager } from "./SiteContentManager";
import { SiteChromeManager } from "./SiteChromeManager";
import { IntegrationManager } from "./IntegrationManager";
import { listPosts } from "@/lib/dashboard/post-actions";
import { listIntegrations } from "@/lib/dashboard/integration-actions";

export type DashboardTab = "overview" | "posts" | "content" | "chrome" | "payment" | "shipping";
const tabs: DashboardTab[] = ["overview", "posts", "content", "chrome", "payment", "shipping"];

export function DashboardClient({
  initialTab = "overview",
}: {
  initialTab?: DashboardTab;
}) {
  const [tab, setTab] = useState<DashboardTab>(
    tabs.includes(initialTab) ? initialTab : "overview",
  );
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    integrations: 0,
  });
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
  function selectTab(next: DashboardTab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("view", "dashboard");
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url);
  }
  function logout() {
    window.location.href = "/dashboard";
  }
  return (
    <div className={`lw vimigo dashboard-shell ${styles.shell}`}>
      <BimiSidebar tab={tab} onSelectTab={selectTab} onLogout={logout} />
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
              <p>Quản lý bài viết, SEO và các tích hợp vận hành của website.</p>
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
              <button
                type="button"
                className="panel"
                onClick={() => selectTab("posts")}
              >
                <span>01</span>
              <strong>Quản lý bài viết</strong>
              <p>Quản lý danh mục, bài viết, lịch đăng và tối ưu SEO.</p>
              </button>
              <button
                type="button"
                className="panel"
                onClick={() => selectTab("payment")}
              >
                <span>02</span>
                <strong>Cấu hình thanh toán</strong>
                <p>Bật cổng thanh toán và thiết lập đối soát.</p>
              </button>
              <button
                type="button"
                className="panel"
                onClick={() => selectTab("content")}
              >
                <span>03</span>
                <strong>Quản lý body</strong>
                <p>Quản lý body theo page, nội dung động, nội dung tĩnh và metadata SEO.</p>
              </button>
              <button
                type="button"
                className="panel"
                onClick={() => selectTab("shipping")}
              >
                <span>04</span>
                <strong>Cấu hình vận chuyển</strong>
                <p>Chọn đơn vị giao hàng và các tính năng vận chuyển.</p>
              </button>
              <button
                type="button"
                className="panel"
                onClick={() => selectTab("chrome")}
              >
                <span>05</span>
                <strong>Quản lý header &amp; footer</strong>
                <p>Quản lý header/footer, menu, liên hệ và bản quyền dùng chung.</p>
              </button>
            </div>
          </section>
        )}
        {tab === "posts" && (
          <section className={styles.content}>
            <ContentManager />
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
      </main>
    </div>
  );
}
