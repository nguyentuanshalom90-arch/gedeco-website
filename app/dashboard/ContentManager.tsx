"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { CategoryManager } from "./CategoryManager";
import { PostComposer } from "./PostComposer";

export function ContentManager() {
  const [view, setView] = useState<"articles" | "categories">(() => {
    if (typeof window === "undefined") return "articles";
    try {
      const saved = window.localStorage.getItem("gedeco:dashboard-posts-view");
      return saved === "categories" ? "categories" : "articles";
    } catch {
      return "articles";
    }
  });
  const panelId = "post-content-panel";
  useEffect(() => {
    try {
      window.localStorage.setItem("gedeco:dashboard-posts-view", view);
    } catch {
      // Fail safe when browser storage is unavailable.
    }
  }, [view]);
  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setView("categories");
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setView("articles");
    }
  }
  return (
    <div className="content-manager post-content-manager">
      <div
        className="content-manager-tabs panel post-dashboard-tabs"
        role="tablist"
        aria-label="Quản lý bài viết"
      >
        <button
          id="post-tab"
          type="button"
          role="tab"
          aria-selected={view === "articles"}
          aria-controls={panelId}
          tabIndex={view === "articles" ? 0 : -1}
          className={view === "articles" ? "active" : ""}
          onKeyDown={onTabKeyDown}
          onClick={() => setView("articles")}
        >
          <Icon name="feather" size={17} />
          Bài viết
        </button>
        <button
          id="post-category-tab"
          type="button"
          role="tab"
          aria-selected={view === "categories"}
          aria-controls={panelId}
          tabIndex={view === "categories" ? 0 : -1}
          className={view === "categories" ? "active" : ""}
          onKeyDown={onTabKeyDown}
          onClick={() => setView("categories")}
        >
          <Icon name="grid" size={17} />
          Danh mục
        </button>
      </div>
      <div id={panelId} role="tabpanel" aria-labelledby={view === "articles" ? "post-tab" : "post-category-tab"} tabIndex={0}>
        {view === "articles" ? <PostComposer /> : <CategoryManager />}
      </div>
    </div>
  );
}
