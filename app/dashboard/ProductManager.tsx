/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { deleteProduct, listDashboardProducts, saveProduct } from "@/lib/dashboard/product-actions";
import type { ProductInput, ProductListItem, ProductMediaInput } from "@/lib/dashboard/product-types";
import { MediaPicker, type MediaSelection } from "./MediaPicker";

const EMPTY: ProductInput = {
  id: null, slug: "", title: "", category: "DOMESTIC", description: "", contentHtml: "", summaryHtml: "",
  priceText: "Liên hệ", stockText: "Còn hàng", imageUrl: "", imageAlt: "", imageCaption: "",
  shipperImageUrl: "/assets/products/shipper.jpg", ogImageUrl: "", ogImageAlt: "", gallery: [],
  metaTitle: "", metaDescription: "", canonicalUrl: "", robotsIndex: true, robotsFollow: true,
  isPublished: true, sortOrder: 0,
};

export function ProductManager() {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [draft, setDraft] = useState<ProductInput>({ ...EMPTY });
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try { setItems(await listDashboardProducts()); } catch (caught) { setError(caught instanceof Error ? caught.message : "Không tải được sản phẩm."); }
  }
  useEffect(() => { void refresh(); }, []);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  function edit(item?: ProductListItem) {
    setDraft(item ? { ...item, gallery: item.gallery.map((media) => ({ ...media })) } : { ...EMPTY, gallery: [] });
    setMessage(""); setError("");
  }
  function selectMain(asset: MediaSelection) {
    setDraft((current) => ({ ...current, imageUrl: asset.url, imageAlt: asset.altText || current.imageAlt || current.title, imageCaption: asset.caption || current.imageCaption }));
  }
  function addGallery(asset: MediaSelection) {
    setDraft((current) => ({ ...current, gallery: [...current.gallery, { id: asset.id, url: asset.url, altText: asset.altText || current.title, caption: asset.caption, sortOrder: current.gallery.length, isPrimary: current.gallery.length === 0 }] }));
  }
  function updateGallery(index: number, patch: Partial<ProductMediaInput>) {
    setDraft((current) => ({ ...current, gallery: current.gallery.map((item, position) => position === index ? { ...item, ...patch } : item) }));
  }
  function moveGallery(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const next = [...current.gallery]; const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, gallery: next.map((item, position) => ({ ...item, sortOrder: position, isPrimary: position === 0 })) };
    });
  }
  async function persist() {
    setSaving(true); setError(""); setMessage("");
    try {
      const result = await saveProduct(draft);
      setItems((current) => [result.product, ...current.filter((item) => item.id !== result.product.id)]);
      setDraft(result.product);
      setMessage(`Đã lưu sản phẩm · English: ${result.translation.status === "TRANSLATED" ? "đã sinh" : result.translation.status === "FAILED" ? "dịch lỗi — bản cũ được giữ nguyên" : "cần rà soát"}.`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể lưu sản phẩm."); }
    finally { setSaving(false); }
  }
  async function remove(item: ProductListItem) {
    if (!window.confirm(`Xóa sản phẩm “${item.title}”?`)) return;
    try { await deleteProduct(item.id); setItems((current) => current.filter((row) => row.id !== item.id)); edit(); setMessage("Đã xóa sản phẩm."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể xóa sản phẩm."); }
  }

  const visible = items.filter((item) => `${item.title} ${item.slug}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));
  return <section className="cms-categories product-manager">
    <div className="dashboard-view-head cms-title-row"><div><p className="eyebrow">DỮ LIỆU XUYÊN SUỐT</p><h1 className="disp">Sản phẩm</h1><p>Quản lý nội dung, media, alt/caption, SEO và bản dịch từ một màn hình.</p></div><button className="btn btn-primary" type="button" onClick={() => edit()}><Icon name="plus" size={16} />Thêm sản phẩm</button></div>
    {(message || error) ? <div className={`cms-notice ${error ? "error" : "success"}`}>{error || message}</div> : null}
    <div className="cms-category-grid">
      <section className="panel cms-list-panel"><div className="cms-list-tools"><div className="cms-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên hoặc slug sản phẩm" /></div></div>{visible.map((item) => <article key={item.id} className={`cms-category-row${draft.id === item.id ? " active" : ""}`}><div><strong>{item.title}</strong><span>/san-pham/{item.category === "EXPORT" ? "xuat-khau" : "trong-nuoc"}/{item.slug}</span><small>{item.category === "EXPORT" ? "Sản phẩm xuất khẩu" : "Sản phẩm trong nước"} · {item.isPublished ? "Đang hiển thị" : "Bản nháp"}</small></div><div className="cms-row-actions"><button className="btn" type="button" onClick={() => edit(item)}><Icon name="pencil" size={15} />Sửa</button><button className="btn cms-danger" type="button" onClick={() => void remove(item)}><Icon name="trash" size={15} />Xóa</button></div></article>)}</section>
      <section className="panel cms-card cms-category-form product-editor">
        <div className="cms-section-head"><div><p className="eyebrow">{draft.id ? "CHỈNH SỬA" : "TẠO MỚI"}</p><h2>{draft.title || "Sản phẩm mới"}</h2></div><span className={`chip ${draft.isPublished ? "success" : ""}`}>{draft.isPublished ? "Đang hiển thị" : "Bản nháp"}</span></div>
        <div className="site-content-form-grid">
          <label className="site-content-full">Tên sản phẩm<input value={draft.title} onChange={(event) => set("title", event.target.value)} /></label>
          <label>Slug<input value={draft.slug} onChange={(event) => set("slug", event.target.value)} placeholder="tự động tạo theo tên" /></label>
          <label>Danh mục<select value={draft.category} onChange={(event) => set("category", event.target.value as ProductInput["category"])}><option value="DOMESTIC">Sản phẩm trong nước</option><option value="EXPORT">Sản phẩm xuất khẩu</option></select></label>
          <label>Giá hiển thị<input value={draft.priceText} onChange={(event) => set("priceText", event.target.value)} /></label>
          <label>Tình trạng<input value={draft.stockText} onChange={(event) => set("stockText", event.target.value)} /></label>
          <label className="site-content-full">Mô tả ngắn<textarea rows={3} value={draft.description} onChange={(event) => set("description", event.target.value)} /></label>
          <label className="site-content-full">Nội dung tóm tắt HTML<textarea rows={5} value={draft.summaryHtml} onChange={(event) => set("summaryHtml", event.target.value)} /></label>
          <label className="site-content-full">Nội dung chi tiết HTML<textarea rows={10} value={draft.contentHtml} onChange={(event) => set("contentHtml", event.target.value)} /></label>
        </div>

        <div className="site-content-seo"><div><p className="eyebrow">ẢNH CHÍNH</p><h3>Media đại diện sản phẩm</h3></div><MediaPicker label="Ảnh chính" value={draft.imageUrl} altText={draft.imageAlt} caption={draft.imageCaption} onSelect={selectMain} onClear={() => setDraft((current) => ({ ...current, imageUrl: "", imageAlt: "", imageCaption: "" }))} /><div className="site-content-form-grid"><label>Alt text<input value={draft.imageAlt} onChange={(event) => set("imageAlt", event.target.value)} /></label><label>Caption<input value={draft.imageCaption} onChange={(event) => set("imageCaption", event.target.value)} /></label></div></div>

        <div className="site-content-seo"><div><p className="eyebrow">ALBUM ẢNH</p><h3>{draft.gallery.length} ảnh</h3><p>Ảnh đầu tiên là ảnh ưu tiên. Có thể sắp xếp và chỉnh alt/caption riêng.</p></div>{draft.gallery.map((media, index) => <article className="product-gallery-editor" key={`${media.id || media.url}-${index}`}><img src={media.url} alt={media.altText || draft.title} /><div><label>Alt text<input value={media.altText} onChange={(event) => updateGallery(index, { altText: event.target.value })} /></label><label>Caption<input value={media.caption} onChange={(event) => updateGallery(index, { caption: event.target.value })} /></label></div><div className="cms-row-actions"><button type="button" className="btn" disabled={index === 0} onClick={() => moveGallery(index, -1)}>Lên</button><button type="button" className="btn" disabled={index === draft.gallery.length - 1} onClick={() => moveGallery(index, 1)}>Xuống</button><button type="button" className="btn cms-danger" onClick={() => set("gallery", draft.gallery.filter((_, position) => position !== index))}>Bỏ</button></div></article>)}<MediaPicker label="Ảnh album mới" value="" altText={draft.title} onSelect={addGallery} /></div>

        <div className="site-content-seo"><div><p className="eyebrow">MEDIA BỔ SUNG</p><h3>Ảnh giao hàng và ảnh mạng xã hội</h3></div><div className="product-media-columns"><div><h4>Ảnh giao hàng</h4><MediaPicker label="Ảnh giao hàng" value={draft.shipperImageUrl} onSelect={(asset) => set("shipperImageUrl", asset.url)} onClear={() => set("shipperImageUrl", "")} /></div><div><h4>Ảnh Open Graph</h4><MediaPicker label="Ảnh Open Graph" value={draft.ogImageUrl} altText={draft.ogImageAlt} onSelect={(asset) => setDraft((current) => ({ ...current, ogImageUrl: asset.url, ogImageAlt: asset.altText || current.title }))} onClear={() => setDraft((current) => ({ ...current, ogImageUrl: "", ogImageAlt: "" }))} /><label>Alt ảnh Open Graph<input value={draft.ogImageAlt} onChange={(event) => set("ogImageAlt", event.target.value)} /></label></div></div></div>

        <div className="site-content-seo"><div><p className="eyebrow">SEO SẢN PHẨM</p><h3>Metadata và chỉ mục</h3></div><div className="site-content-seo-grid"><label>SEO title <small>{draft.metaTitle.length}/65</small><input maxLength={65} value={draft.metaTitle} onChange={(event) => set("metaTitle", event.target.value)} placeholder={draft.title} /></label><label className="site-content-full">Meta description <small>{draft.metaDescription.length}/160</small><textarea rows={3} maxLength={160} value={draft.metaDescription} onChange={(event) => set("metaDescription", event.target.value)} placeholder={draft.description} /></label><label>Canonical URL<input value={draft.canonicalUrl} onChange={(event) => set("canonicalUrl", event.target.value)} placeholder={`/san-pham/${draft.category === "EXPORT" ? "xuat-khau" : "trong-nuoc"}/${draft.slug || "slug"}`} /></label><label>Thứ tự<input type="number" value={draft.sortOrder} onChange={(event) => set("sortOrder", Number(event.target.value))} /></label><div className="site-content-checks"><label><input type="checkbox" checked={draft.robotsIndex} onChange={(event) => set("robotsIndex", event.target.checked)} /> Index</label><label><input type="checkbox" checked={draft.robotsFollow} onChange={(event) => set("robotsFollow", event.target.checked)} /> Follow</label><label><input type="checkbox" checked={draft.isPublished} onChange={(event) => set("isPublished", event.target.checked)} /> Hiển thị frontend</label></div></div></div>
        <button className="btn btn-primary" type="button" disabled={saving} onClick={() => void persist()}>{saving ? "Đang lưu…" : "Lưu sản phẩm và đồng bộ English"}</button>
      </section>
    </div>
  </section>;
}
