"use client";

import { useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { ProductCategoryManager } from "./ProductCategoryManager";
import { ProductManager } from "./ProductManager";

export function ProductContentManager() {
  const [view, setView] = useState<"products" | "categories">("products");
  return <div className="content-manager">
    <div className="content-manager-tabs panel" role="tablist" aria-label="Quản lý sản phẩm">
      <button type="button" role="tab" aria-selected={view === "products"} className={view === "products" ? "active" : ""} onClick={() => setView("products")}><Icon name="box" size={17} />Sản phẩm</button>
      <button type="button" role="tab" aria-selected={view === "categories"} className={view === "categories" ? "active" : ""} onClick={() => setView("categories")}><Icon name="grid" size={17} />Danh mục sản phẩm</button>
    </div>
    {view === "products" ? <ProductManager /> : <ProductCategoryManager />}
  </div>;
}
