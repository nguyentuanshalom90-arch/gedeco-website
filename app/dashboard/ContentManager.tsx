"use client";

import { useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { CategoryManager } from "./CategoryManager";
import { PostComposer } from "./PostComposer";

export function ContentManager() {
  const [view, setView] = useState<"categories" | "articles">("articles");
  return (
    <div className="content-manager">
      <div
        className="content-manager-tabs panel"
        role="tablist"
        aria-label="Quản lý bài viết"
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === "categories"}
          className={view === "categories" ? "active" : ""}
          onClick={() => setView("categories")}
        >
          <Icon name="grid" size={17} />
          Danh mục bài viết
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "articles"}
          className={view === "articles" ? "active" : ""}
          onClick={() => setView("articles")}
        >
          <Icon name="feather" size={17} />
          Quản lý bài viết
        </button>
      </div>
      {view === "categories" ? <CategoryManager /> : <PostComposer />}
    </div>
  );
}
