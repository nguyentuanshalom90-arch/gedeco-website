"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { deleteProductCategory, listProductCategories, saveProductCategory } from "@/lib/dashboard/product-category-actions";
import type { ProductCategoryInput, ProductCategoryListItem } from "@/lib/dashboard/product-category-types";
import { MediaPicker, type MediaSelection } from "./MediaPicker";

const EMPTY: ProductCategoryInput = {
  id: null, name: "", slug: "", description: "", nameEn: "", slugEn: "", descriptionEn: "",
  imageUrl: "", imageAlt: "", imageCaption: "", imageAltEn: "", imageCaptionEn: "", metaTitle: "", metaDescription: "", metaTitleEn: "", metaDescriptionEn: "",
  canonicalUrl: "", canonicalUrlEn: "", robotsIndex: true, robotsFollow: true, isPublished: true, sortOrder: 0,
};

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export function ProductCategoryManager() {
  const [items, setItems] = useState<ProductCategoryListItem[]>([]);
  const [draft, setDraft] = useState<ProductCategoryInput>({ ...EMPTY });
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const visible = useMemo(() => items.filter((item) => `${item.name} ${item.nameEn} ${item.slug} ${item.slugEn}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))), [items, query]);

  useEffect(() => { listProductCategories().then(setItems).catch((reason) => setError(reason instanceof Error ? reason.message : "Không tải được danh mục sản phẩm.")); }, []);
  const set = <K extends keyof ProductCategoryInput>(key: K, value: ProductCategoryInput[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const edit = (item?: ProductCategoryListItem) => { setDraft(item ? { ...item } : { ...EMPTY }); setMessage(""); setError(""); };
  const selectImage = (asset: MediaSelection) => setDraft((current) => ({ ...current, imageUrl: asset.url, imageAlt: asset.altText || current.imageAlt || current.name, imageCaption: asset.caption || current.imageCaption }));

  async function persist() {
    setSaving(true); setError(""); setMessage("");
    try {
      const result = await saveProductCategory(draft);
      setItems((current) => [result.category, ...current.filter((item) => item.id !== result.category.id)].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "vi")));
      setDraft(result.category); setMessage("Đã lưu danh mục sản phẩm.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể lưu danh mục."); }
    finally { setSaving(false); }
  }

  async function remove(item: ProductCategoryListItem) {
    if (!window.confirm(`Xóa danh mục “${item.name}”?`)) return;
    setDeleting(item.id);
    try { await deleteProductCategory(item.id); setItems((current) => current.filter((row) => row.id !== item.id)); if (draft.id === item.id) edit(); setMessage("Đã xóa danh mục sản phẩm."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể xóa danh mục."); }
    finally { setDeleting(null); }
  }

  return <section className="cms-categories product-manager">
    <div className="dashboard-view-head cms-title-row"><div><p className="eyebrow">CẤU TRÚC CATALOG</p><h1 className="disp">Danh mục sản phẩm</h1><p>Quản lý tên, URL, media, SEO và trạng thái VI/EN từ database.</p></div><button className="btn btn-primary" type="button" onClick={() => edit()}><Icon name="plus" size={16} />Thêm danh mục</button></div>
    {(message || error) && <div className={`cms-notice ${error ? "error" : "success"}`}>{error || message}</div>}
    <div className="cms-category-grid">
      <section className="panel cms-list-panel"><div className="cms-list-tools"><div className="cms-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên hoặc slug danh mục" /></div></div>{visible.map((item) => <article key={item.id} className={`cms-category-row${draft.id === item.id ? " active" : ""}`}><div><strong>{item.name}</strong><span>/san-pham/{item.slug} · /en/products/{item.slugEn}</span><small>{item.productCount} sản phẩm · {item.isPublished ? "Đang hiển thị" : "Đang ẩn"}</small></div><div className="cms-row-actions"><button className="btn" type="button" onClick={() => edit(item)} disabled={Boolean(deleting)}><Icon name="pencil" size={15} />Sửa</button><button className="btn cms-danger" type="button" onClick={() => void remove(item)} disabled={deleting === item.id || saving}><Icon name="trash" size={15} />{deleting === item.id ? "Đang xóa…" : "Xóa"}</button></div></article>)}</section>
      <section className="panel cms-card cms-category-form product-editor">
        <div className="cms-section-head"><div><p className="eyebrow">{draft.id ? "CHỈNH SỬA" : "TẠO MỚI"}</p><h2>{draft.name || "Danh mục mới"}</h2></div><span className={`chip ${draft.isPublished ? "success" : ""}`}>{draft.isPublished ? "Đang hiển thị" : "Đang ẩn"}</span></div>
        <div className="site-content-form-grid">
          <label>Tên tiếng Việt<input value={draft.name} onChange={(event) => { const name = event.target.value; setDraft((current) => ({ ...current, name, slug: current.id || current.slug ? current.slug : slugify(name) })); }} /></label>
          <label>Slug tiếng Việt<input value={draft.slug} onChange={(event) => set("slug", slugify(event.target.value))} /></label>
          <label className="site-content-full">Mô tả tiếng Việt<textarea rows={3} value={draft.description} onChange={(event) => set("description", event.target.value)} /></label>
          <label>English name<input value={draft.nameEn} onChange={(event) => { const nameEn = event.target.value; setDraft((current) => ({ ...current, nameEn, slugEn: current.id || current.slugEn ? current.slugEn : slugify(nameEn) })); }} /></label>
          <label>English slug<input value={draft.slugEn} onChange={(event) => set("slugEn", slugify(event.target.value))} /></label>
          <label className="site-content-full">English description<textarea rows={3} value={draft.descriptionEn} onChange={(event) => set("descriptionEn", event.target.value)} /></label>
          <label>Thứ tự<input type="number" value={draft.sortOrder} onChange={(event) => set("sortOrder", Number(event.target.value) || 0)} /></label>
          <div className="site-content-checks"><label><input type="checkbox" checked={draft.isPublished} onChange={(event) => set("isPublished", event.target.checked)} /> Hiển thị frontend</label><label><input type="checkbox" checked={draft.robotsIndex} onChange={(event) => set("robotsIndex", event.target.checked)} /> Index</label><label><input type="checkbox" checked={draft.robotsFollow} onChange={(event) => set("robotsFollow", event.target.checked)} /> Follow</label></div>
        </div>
        <div className="site-content-seo"><div><p className="eyebrow">MEDIA DANH MỤC</p><h3>Ảnh đại diện song ngữ</h3></div><MediaPicker label="Ảnh danh mục" value={draft.imageUrl} altText={draft.imageAlt} caption={draft.imageCaption} onSelect={selectImage} onClear={() => setDraft((current) => ({ ...current, imageUrl: "", imageAlt: "", imageCaption: "", imageAltEn: "", imageCaptionEn: "" }))} /><div className="site-content-form-grid"><label>Alt text VI<input value={draft.imageAlt} onChange={(event) => set("imageAlt", event.target.value)} /></label><label>Caption VI<input value={draft.imageCaption} onChange={(event) => set("imageCaption", event.target.value)} /></label><label>Alt text EN<input value={draft.imageAltEn} onChange={(event) => set("imageAltEn", event.target.value)} /></label><label>Caption EN<input value={draft.imageCaptionEn} onChange={(event) => set("imageCaptionEn", event.target.value)} /></label></div></div>
        <div className="site-content-seo"><div><p className="eyebrow">SEO SONG NGỮ</p><h3>Metadata và canonical</h3></div><div className="site-content-seo-grid">
          <label>SEO title VI <small>{draft.metaTitle.length}/65</small><input maxLength={65} value={draft.metaTitle} onChange={(event) => set("metaTitle", event.target.value)} /></label><label>SEO title EN <small>{draft.metaTitleEn.length}/65</small><input maxLength={65} value={draft.metaTitleEn} onChange={(event) => set("metaTitleEn", event.target.value)} /></label>
          <label>Meta description VI <small>{draft.metaDescription.length}/160</small><textarea rows={3} maxLength={160} value={draft.metaDescription} onChange={(event) => set("metaDescription", event.target.value)} /></label><label>Meta description EN <small>{draft.metaDescriptionEn.length}/160</small><textarea rows={3} maxLength={160} value={draft.metaDescriptionEn} onChange={(event) => set("metaDescriptionEn", event.target.value)} /></label>
          <label>Canonical VI<input value={draft.canonicalUrl} onChange={(event) => set("canonicalUrl", event.target.value)} placeholder={`/san-pham/${draft.slug || "slug"}`} /></label><label>Canonical EN<input value={draft.canonicalUrlEn} onChange={(event) => set("canonicalUrlEn", event.target.value)} placeholder={`/en/products/${draft.slugEn || "slug"}`} /></label>
        </div></div>
        <button className="btn btn-primary cms-save-category" type="button" disabled={saving} onClick={() => void persist()}><Icon name="check" size={16} />{saving ? "Đang lưu…" : "Lưu danh mục"}</button>
      </section>
    </div>
  </section>;
}
