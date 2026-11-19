/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { deleteProduct, listDashboardProducts, saveProduct } from "@/lib/dashboard/product-actions";
import type { ProductInput, ProductListItem, ProductMediaInput } from "@/lib/dashboard/product-types";
import { listProductCategories } from "@/lib/dashboard/product-category-actions";
import type { ProductCategoryListItem } from "@/lib/dashboard/product-category-types";
import { MediaPicker, type MediaSelection } from "./MediaPicker";

const EMPTY: ProductInput = {
  id: null, slug: "", title: "", categoryId: "", description: "", contentHtml: "", summaryHtml: "",
  priceText: "Liên hệ", stockText: "Còn hàng", imageUrl: "", imageAlt: "", imageCaption: "",
  shipperImageUrl: "/assets/products/shipper.optimized.webp", shipperImageAlt: "Dịch vụ giao hàng", shipperImageCaption: "", ogImageUrl: "", ogImageAlt: "", gallery: [],
  metaTitle: "", metaDescription: "", canonicalUrl: "", robotsIndex: true, robotsFollow: true,
  isPublished: true, sortOrder: 0,
  translationMode: "AUTO", translationStatus: "PENDING", translationError: "",
  slugEn: "", titleEn: "", descriptionEn: "", contentHtmlEn: "", summaryHtmlEn: "",
  priceTextEn: "Contact us", stockTextEn: "In stock", imageAltEn: "", imageCaptionEn: "", shipperImageAltEn: "Delivery service", shipperImageCaptionEn: "",
  ogImageAltEn: "", metaTitleEn: "", metaDescriptionEn: "", canonicalUrlEn: "",
};

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function htmlToPlainText(value: string) {
  if (!value) return "";
  if (typeof window !== "undefined") {
    const container = document.createElement("div");
    container.innerHTML = value;
    return (container.innerText || container.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
  }
  return value.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6])>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function plainTextToHtml(value: string) {
  return value.split(/\n{2,}/).map((block) => {
    const image = block.trim().match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/);
    if (image) return `<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" loading="lazy">${image[3] ? `<figcaption>${escapeHtml(image[3])}</figcaption>` : ""}</figure>`;
    return `<p>${block.split("\n").map((line) => escapeHtml(line)).join("<br>")}</p>`;
  }).filter(Boolean).join("\n");
}

function ContentMediaAppender({ label, onAppend }: { label: string; onAppend: (markdown: string) => void }) {
  return <div className="product-html-media"><MediaPicker label={label} value="" onSelect={(asset) => {
    const alt = (asset.altText || asset.name).replace(/[\[\]]/g, "");
    const caption = asset.caption ? ` "${asset.caption.replace(/"/g, "'")}"` : "";
    onAppend(`![${alt}](${asset.url}${caption})`);
  }} /></div>;
}

export function ProductManager() {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<ProductCategoryListItem[]>([]);
  const [draft, setDraft] = useState<ProductInput>({ ...EMPTY });
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function refresh() {
    try {
      const [products, categoryItems] = await Promise.all([listDashboardProducts(), listProductCategories()]);
      setItems(products); setCategories(categoryItems);
      setDraft((current) => current.categoryId ? current : { ...current, categoryId: categoryItems[0]?.id || "" });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không tải được sản phẩm."); }
  }
  useEffect(() => { void refresh(); }, []);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  function edit(item?: ProductListItem) {
    setDraft(item ? { ...item, summaryHtml: htmlToPlainText(item.summaryHtml), contentHtml: htmlToPlainText(item.contentHtml), summaryHtmlEn: htmlToPlainText(item.summaryHtmlEn), contentHtmlEn: htmlToPlainText(item.contentHtmlEn), gallery: item.gallery.map((media) => ({ ...media })) } : { ...EMPTY, categoryId: categories[0]?.id || "", gallery: [] });
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
      const result = await saveProduct({ ...draft, summaryHtml: plainTextToHtml(draft.summaryHtml), contentHtml: plainTextToHtml(draft.contentHtml), summaryHtmlEn: plainTextToHtml(draft.summaryHtmlEn), contentHtmlEn: plainTextToHtml(draft.contentHtmlEn) });
      setItems((current) => [result.product, ...current.filter((item) => item.id !== result.product.id)]);
      setDraft({ ...result.product, summaryHtml: htmlToPlainText(result.product.summaryHtml), contentHtml: htmlToPlainText(result.product.contentHtml), summaryHtmlEn: htmlToPlainText(result.product.summaryHtmlEn), contentHtmlEn: htmlToPlainText(result.product.contentHtmlEn) });
      setMessage(`Đã lưu sản phẩm · English: ${result.translation.status === "TRANSLATED" ? "đã sinh" : result.translation.status === "FAILED" ? "dịch lỗi — bản cũ được giữ nguyên" : "cần rà soát"}.`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể lưu sản phẩm."); }
    finally { setSaving(false); }
  }
  async function remove(item: ProductListItem) {
    if (!window.confirm(`Xóa sản phẩm “${item.title}”?`)) return;
    setDeleting(item.id);
    try { await deleteProduct(item.id); setItems((current) => current.filter((row) => row.id !== item.id)); edit(); setMessage("Đã xóa sản phẩm."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể xóa sản phẩm."); }
    finally { setDeleting(null); }
  }

  const visible = items.filter((item) => `${item.title} ${item.slug}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));
  return <section className="cms-categories product-manager">
    <div className="dashboard-view-head cms-title-row"><div><p className="eyebrow">DỮ LIỆU XUYÊN SUỐT</p><h1 className="disp">Sản phẩm</h1><p>Quản lý nội dung, media, alt/caption, SEO và bản dịch từ một màn hình.</p></div><button className="btn btn-primary" type="button" onClick={() => edit()}><Icon name="plus" size={16} />Thêm sản phẩm</button></div>
    {(message || error) ? <div className={`cms-notice ${error ? "error" : "success"}`}>{error || message}</div> : null}
    <div className="cms-category-grid">
      <section className="panel cms-list-panel"><div className="cms-list-tools"><div className="cms-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên hoặc slug sản phẩm" /></div></div>{visible.map((item) => <article key={item.id} className={`cms-category-row${draft.id === item.id ? " active" : ""}`}><div><strong>{item.title}</strong><span>/san-pham/{item.categorySlug}/{item.slug}</span><small>{item.categoryName} · {item.isPublished ? "Đang hiển thị" : "Bản nháp"}</small></div><div className="cms-row-actions"><button className="btn" type="button" onClick={() => edit(item)} disabled={Boolean(deleting)}><Icon name="pencil" size={15} />Sửa</button><button className="btn cms-danger" type="button" onClick={() => void remove(item)} disabled={deleting === item.id || saving}><Icon name="trash" size={15} />{deleting === item.id ? "Đang xóa…" : "Xóa"}</button></div></article>)}</section>
      <section className="panel cms-card cms-category-form product-editor">
        <div className="cms-section-head"><div><p className="eyebrow">{draft.id ? "CHỈNH SỬA" : "TẠO MỚI"}</p><h2>{draft.title || "Sản phẩm mới"}</h2></div><span className={`chip ${draft.isPublished ? "success" : ""}`}>{draft.isPublished ? "Đang hiển thị" : "Bản nháp"}</span></div>
        <div className="site-content-form-grid">
          <label className="site-content-full">Tên sản phẩm<input value={draft.title} onChange={(event) => set("title", event.target.value)} /></label>
          <label>Slug<input value={draft.slug} onChange={(event) => set("slug", event.target.value)} placeholder="tự động tạo theo tên" /></label>
          <label>Danh mục<select value={draft.categoryId} onChange={(event) => set("categoryId", event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.isPublished ? "" : " (đang ẩn)"}</option>)}</select></label>
          <label>Giá hiển thị<input value={draft.priceText} onChange={(event) => set("priceText", event.target.value)} /></label>
          <label>Tình trạng<input value={draft.stockText} onChange={(event) => set("stockText", event.target.value)} /></label>
          <label className="site-content-full">Mô tả ngắn<textarea rows={3} value={draft.description} onChange={(event) => set("description", event.target.value)} /></label>
          <label className="site-content-full">Nội dung tóm tắt<textarea rows={5} value={draft.summaryHtml} onChange={(event) => set("summaryHtml", event.target.value)} placeholder="Nhập nội dung bình thường, mỗi đoạn cách nhau một dòng trống." /></label>
          <div className="site-content-full"><ContentMediaAppender label="Chèn ảnh vào tóm tắt" onAppend={(markdown) => set("summaryHtml", `${draft.summaryHtml}\n\n${markdown}`.trim())} /></div>
          <label className="site-content-full">Nội dung chi tiết<textarea rows={10} value={draft.contentHtml} onChange={(event) => set("contentHtml", event.target.value)} placeholder="Nhập nội dung bình thường, không cần biết HTML." /></label>
          <div className="site-content-full"><ContentMediaAppender label="Chèn ảnh vào nội dung chi tiết" onAppend={(markdown) => set("contentHtml", `${draft.contentHtml}\n\n${markdown}`.trim())} /></div>
        </div>

        <div className="site-content-seo"><div><p className="eyebrow">ẢNH CHÍNH</p><h3>Media đại diện sản phẩm</h3></div><MediaPicker label="Ảnh chính" value={draft.imageUrl} altText={draft.imageAlt} caption={draft.imageCaption} onSelect={selectMain} onClear={() => setDraft((current) => ({ ...current, imageUrl: "", imageAlt: "", imageCaption: "" }))} /><div className="site-content-form-grid"><label>Alt text<input value={draft.imageAlt} onChange={(event) => set("imageAlt", event.target.value)} /></label><label>Caption<input value={draft.imageCaption} onChange={(event) => set("imageCaption", event.target.value)} /></label></div></div>

        <div className="site-content-seo"><div><p className="eyebrow">ALBUM ẢNH</p><h3>{draft.gallery.length} ảnh</h3><p>Ảnh đầu tiên là ảnh ưu tiên. Có thể sắp xếp và chỉnh alt/caption riêng.</p></div>{draft.gallery.map((media, index) => <article className="product-gallery-editor" key={`${media.id || media.url}-${index}`}><img src={media.url} alt={media.altText || draft.title} /><div><label>Alt text VI<input value={media.altText} onChange={(event) => updateGallery(index, { altText: event.target.value })} /></label><label>Caption VI<input value={media.caption} onChange={(event) => updateGallery(index, { caption: event.target.value })} /></label>{draft.translationMode === "MANUAL" && <><label>Alt text EN<input value={media.altTextEn || ""} onChange={(event) => updateGallery(index, { altTextEn: event.target.value })} /></label><label>Caption EN<input value={media.captionEn || ""} onChange={(event) => updateGallery(index, { captionEn: event.target.value })} /></label></>}</div><div className="cms-row-actions"><button type="button" className="btn" disabled={index === 0} onClick={() => moveGallery(index, -1)}>Lên</button><button type="button" className="btn" disabled={index === draft.gallery.length - 1} onClick={() => moveGallery(index, 1)}>Xuống</button><button type="button" className="btn cms-danger" onClick={() => set("gallery", draft.gallery.filter((_, position) => position !== index))}>Bỏ</button></div></article>)}<MediaPicker label="Ảnh album mới" value="" altText={draft.title} onSelect={addGallery} /></div>

        <div className="site-content-seo"><div><p className="eyebrow">MEDIA BỔ SUNG</p><h3>Ảnh giao hàng và ảnh mạng xã hội</h3></div><div className="product-media-columns"><div><h4>Ảnh giao hàng</h4><MediaPicker label="Ảnh giao hàng" value={draft.shipperImageUrl} altText={draft.shipperImageAlt} caption={draft.shipperImageCaption} onSelect={(asset) => setDraft((current) => ({ ...current, shipperImageUrl: asset.url, shipperImageAlt: asset.altText || current.shipperImageAlt || current.title, shipperImageCaption: asset.caption || current.shipperImageCaption }))} onClear={() => setDraft((current) => ({ ...current, shipperImageUrl: "", shipperImageAlt: "", shipperImageCaption: "" }))} /><label>Alt ảnh giao hàng<input value={draft.shipperImageAlt} onChange={(event) => set("shipperImageAlt", event.target.value)} /></label><label>Caption ảnh giao hàng<input value={draft.shipperImageCaption} onChange={(event) => set("shipperImageCaption", event.target.value)} /></label></div><div><h4>Ảnh Open Graph</h4><MediaPicker label="Ảnh Open Graph" value={draft.ogImageUrl} altText={draft.ogImageAlt} onSelect={(asset) => setDraft((current) => ({ ...current, ogImageUrl: asset.url, ogImageAlt: asset.altText || current.title }))} onClear={() => setDraft((current) => ({ ...current, ogImageUrl: "", ogImageAlt: "" }))} /><label>Alt ảnh Open Graph<input value={draft.ogImageAlt} onChange={(event) => set("ogImageAlt", event.target.value)} /></label></div></div></div>

        <div className="site-content-seo"><div><p className="eyebrow">SEO SẢN PHẨM</p><h3>Metadata và chỉ mục</h3></div><div className="site-content-seo-grid"><label>SEO title <small>{draft.metaTitle.length}/65</small><input maxLength={65} value={draft.metaTitle} onChange={(event) => set("metaTitle", event.target.value)} placeholder={draft.title} /></label><label className="site-content-full">Meta description <small>{draft.metaDescription.length}/160</small><textarea rows={3} maxLength={160} value={draft.metaDescription} onChange={(event) => set("metaDescription", event.target.value)} placeholder={draft.description} /></label><label>Canonical URL<input value={draft.canonicalUrl} onChange={(event) => set("canonicalUrl", event.target.value)} placeholder={`/san-pham/${categories.find((category) => category.id === draft.categoryId)?.slug || "danh-muc"}/${draft.slug || "slug"}`} /></label><label>Thứ tự<input type="number" value={draft.sortOrder} onChange={(event) => set("sortOrder", Number(event.target.value))} /></label><div className="site-content-checks"><label><input type="checkbox" checked={draft.robotsIndex} onChange={(event) => set("robotsIndex", event.target.checked)} /> Index</label><label><input type="checkbox" checked={draft.robotsFollow} onChange={(event) => set("robotsFollow", event.target.checked)} /> Follow</label><label><input type="checkbox" checked={draft.isPublished} onChange={(event) => set("isPublished", event.target.checked)} /> Hiển thị frontend</label></div></div></div>
        <div className="site-content-seo"><div><p className="eyebrow">ENGLISH</p><h3>Bản tiếng Anh</h3><p>Chọn tự nhập khi cần duyệt chính xác; bản tự động lỗi sẽ không được công khai.</p></div><div className="site-content-checks"><label><input type="radio" name="product-translation-mode" checked={draft.translationMode === "AUTO"} onChange={() => set("translationMode", "AUTO")} /> Dịch tự động</label><label><input type="radio" name="product-translation-mode" checked={draft.translationMode === "MANUAL"} onChange={() => set("translationMode", "MANUAL")} /> Tự nhập và duyệt</label></div><p>Trạng thái: <strong>{draft.translationStatus || "PENDING"}</strong>{draft.translationError ? ` · ${draft.translationError}` : ""}</p>{draft.translationMode === "MANUAL" && <div className="site-content-form-grid"><label className="site-content-full">Product name<input value={draft.titleEn} onChange={(event) => set("titleEn", event.target.value)} /></label><label>English slug<input value={draft.slugEn} onChange={(event) => set("slugEn", event.target.value)} placeholder="generated-from-name" /></label><label>Price text<input value={draft.priceTextEn} onChange={(event) => set("priceTextEn", event.target.value)} /></label><label>Stock text<input value={draft.stockTextEn} onChange={(event) => set("stockTextEn", event.target.value)} /></label><label className="site-content-full">Short description<textarea rows={3} value={draft.descriptionEn} onChange={(event) => set("descriptionEn", event.target.value)} /></label><label className="site-content-full">Summary<textarea rows={5} value={draft.summaryHtmlEn} onChange={(event) => set("summaryHtmlEn", (event.target.value))} /></label><div className="site-content-full"><ContentMediaAppender label="Insert image into English summary" onAppend={(markdown) => set("summaryHtmlEn", `${draft.summaryHtmlEn}\n\n${markdown}`.trim())} /></div><label className="site-content-full">Detail content<textarea rows={10} value={draft.contentHtmlEn} onChange={(event) => set("contentHtmlEn", event.target.value)} /></label><div className="site-content-full"><ContentMediaAppender label="Insert image into English detail" onAppend={(markdown) => set("contentHtmlEn", `${draft.contentHtmlEn}\n\n${markdown}`.trim())} /></div><label>Main image alt<input value={draft.imageAltEn} onChange={(event) => set("imageAltEn", event.target.value)} /></label><label>Main image caption<input value={draft.imageCaptionEn} onChange={(event) => set("imageCaptionEn", event.target.value)} /></label><label>Delivery image alt<input value={draft.shipperImageAltEn} onChange={(event) => set("shipperImageAltEn", event.target.value)} /></label><label>Delivery image caption<input value={draft.shipperImageCaptionEn} onChange={(event) => set("shipperImageCaptionEn", event.target.value)} /></label><label>Open Graph alt<input value={draft.ogImageAltEn} onChange={(event) => set("ogImageAltEn", event.target.value)} /></label><label>SEO title <small>{draft.metaTitleEn.length}/65</small><input maxLength={65} value={draft.metaTitleEn} onChange={(event) => set("metaTitleEn", event.target.value)} /></label><label className="site-content-full">Meta description <small>{draft.metaDescriptionEn.length}/160</small><textarea rows={3} maxLength={160} value={draft.metaDescriptionEn} onChange={(event) => set("metaDescriptionEn", event.target.value)} /></label><label className="site-content-full">Canonical English<input value={draft.canonicalUrlEn} onChange={(event) => set("canonicalUrlEn", event.target.value)} placeholder="/en/products/category/product-slug" /></div>}</div>
        <button className="btn btn-primary" type="button" disabled={saving} onClick={() => void persist()}>{saving ? "Đang lưu…" : "Lưu sản phẩm và đồng bộ English"}</button>
      </section>
    </div>
  </section>;
}
