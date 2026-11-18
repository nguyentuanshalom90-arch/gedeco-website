"use client";

import { useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { ProductCategoryManager } from "./ProductCategoryManager";
import { ProductManager } from "./ProductManager";

export function ProductContentManager() {
  const [view, setView] = useState<"products" | "categories">("products");
  const panelId = "product-content-panel";
  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setView("categories");
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setView("products");
    }
  }
  return <div className="content-manager">
    <div className="content-manager-tabs panel" role="tablist" aria-label="Quản lý sản phẩm">
      <button id="product-tab" type="button" role="tab" aria-selected={view === "products"} aria-controls={panelId} tabIndex={view === "products" ? 0 : -1} className={view === "products" ? "active" : ""} onKeyDown={onTabKeyDown} onClick={() => setView("products")}><Icon name="box" size={17} />Sản phẩm</button>
      <button id="category-tab" type="button" role="tab" aria-selected={view === "categories"} aria-controls={panelId} tabIndex={view === "categories" ? 0 : -1} className={view === "categories" ? "active" : ""} onKeyDown={onTabKeyDown} onClick={() => setView("categories")}><Icon name="grid" size={17} />Danh mục sản phẩm</button>
    </div>
    <div id={panelId} role="tabpanel" aria-labelledby={view === "products" ? "product-tab" : "category-tab"} tabIndex={0}>
      {view === "products" ? <ProductManager /> : <ProductCategoryManager />}
    </div>
  </div>;
}
