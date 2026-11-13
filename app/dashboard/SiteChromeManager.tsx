/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { deleteSiteChrome, listSiteChrome, saveSiteChrome } from "@/lib/dashboard/site-chrome-actions";
import type { SiteChromeArea, SiteChromeInput, SiteChromeItem, SiteChromeKind } from "@/lib/dashboard/site-chrome-types";

function emptyItem(area: SiteChromeArea, kind: SiteChromeKind): SiteChromeInput {
  return { area, kind, sectionKey: area === "HEADER" ? "navigation" : "contact", fieldKey: "new-field", label: "Nội dung mới", value: "", url: "", imageUrl: "", altText: "", isVisible: true, sortOrder: 99 };
}

type MediaAsset = { id: string; url: string; name: string };

async function uploadMedia(file: File) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/media", { method: "POST", body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Tải ảnh thất bại.");
  return payload.url as string;
}

export function SiteChromeManager() {
  const [area, setArea] = useState<SiteChromeArea>("HEADER");
  const [kind, setKind] = useState<SiteChromeKind>("DYNAMIC");
  const [items, setItems] = useState<SiteChromeItem[]>([]);
  const [editing, setEditing] = useState<SiteChromeInput>(emptyItem("HEADER", "DYNAMIC"));
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function load(nextArea = area, nextKind = kind) {
    setBusy(true);
    try { setItems(await listSiteChrome(nextArea, nextKind)); setNotice(""); } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể tải nội dung header/footer."); } finally { setBusy(false); }
  }
  useEffect(() => { void load(area, kind); }, [area, kind]);

  function setField<K extends keyof SiteChromeInput>(field: K, value: SiteChromeInput[K]) { setEditing((current) => ({ ...current, [field]: value })); }
  function createNew() { setEditing(emptyItem(area, kind)); setNotice(""); }
  function edit(item: SiteChromeItem) { setEditing({ ...item }); setNotice(""); }

  async function openLibrary() {
    setMediaOpen(true); setBusy(true);
    try { const response = await fetch("/api/media"); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setAssets(payload.assets || []); } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể tải thư viện ảnh."); } finally { setBusy(false); }
  }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { setField("imageUrl", await uploadMedia(file)); setMediaOpen(false); setNotice("Đã tải ảnh và lưu vào thư viện media."); } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể tải ảnh."); } finally { setBusy(false); event.target.value = ""; }
  }
  async function save() {
    setBusy(true);
    try { const result = await saveSiteChrome(editing); setItems((current) => [result.item, ...current.filter((item) => item.id !== result.item.id)]); setEditing({ ...result.item }); setNotice(`Đã lưu nội dung Header/Footer. English: ${result.translation.status === "TRANSLATED" ? "đã sinh" : result.translation.status === "FAILED" ? "dịch lỗi — bản cũ được giữ nguyên" : "cần rà soát"}.`); } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể lưu nội dung."); } finally { setBusy(false); }
  }
  async function remove() {
    if (!editing.id || !window.confirm("Xóa nội dung Header/Footer này?")) return;
    setBusy(true);
    try { await deleteSiteChrome(editing.id); setItems((current) => current.filter((item) => item.id !== editing.id)); createNew(); setNotice("Đã xóa nội dung."); } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể xóa nội dung."); } finally { setBusy(false); }
  }

  return <section className="site-chrome-manager">
      <div className="dashboard-view-head cms-title-row"><div><p className="eyebrow">GIAO DIỆN DÙNG CHUNG</p><h1 className="disp">Quản lý header &amp; footer</h1><p>Quản lý logo, menu, CTA, thông tin liên hệ, liên kết mạng xã hội và bản quyền dùng trên toàn website.</p></div><button type="button" className="btn btn-primary" onClick={createNew}><Icon name="plus" size={16} /> Thêm nội dung</button></div>
    <div className="site-chrome-tabs panel" role="tablist" aria-label="Khu vực giao diện dùng chung"><button type="button" role="tab" aria-selected={area === "HEADER"} className={area === "HEADER" ? "active" : ""} onClick={() => { setArea("HEADER"); setKind("DYNAMIC"); setEditing(emptyItem("HEADER", "DYNAMIC")); }}><Icon name="grid" size={18} /><span><strong>Header</strong><small>Logo, menu và CTA đầu trang</small></span></button><button type="button" role="tab" aria-selected={area === "FOOTER"} className={area === "FOOTER" ? "active" : ""} onClick={() => { setArea("FOOTER"); setKind("DYNAMIC"); setEditing(emptyItem("FOOTER", "DYNAMIC")); }}><Icon name="layers" size={18} /><span><strong>Footer</strong><small>Thương hiệu, liên hệ và liên kết cuối trang</small></span></button></div>
    <div className="site-chrome-subtabs panel" role="tablist" aria-label={`Loại nội dung ${area === "HEADER" ? "Header" : "Footer"}`}><button type="button" role="tab" aria-selected={kind === "DYNAMIC"} className={kind === "DYNAMIC" ? "active" : ""} onClick={() => { setKind("DYNAMIC"); setEditing(emptyItem(area, "DYNAMIC")); }}><Icon name="database" size={17} /><span><strong>Nội dung động</strong><small>Quản lý qua database</small></span></button><button type="button" role="tab" aria-selected={kind === "STATIC"} className={kind === "STATIC" ? "active" : ""} onClick={() => { setKind("STATIC"); setEditing(emptyItem(area, "STATIC")); }}><Icon name="code" size={17} /><span><strong>Nội dung tĩnh</strong><small>Nội dung cố định của giao diện</small></span></button></div>
    <div className="site-chrome-workspace"><aside className="panel site-chrome-list"><div className="site-chrome-list-head"><div><strong>{items.length} nội dung</strong><small>{area === "HEADER" ? "Header" : "Footer"} · {kind === "DYNAMIC" ? "Nội dung động" : "Nội dung tĩnh"}</small></div><button type="button" className="btn btn-secondary" onClick={() => void load()} disabled={busy}><Icon name="history" size={15} /> Làm mới</button></div><div className="site-chrome-list-items">{items.map((item) => <button type="button" key={item.id} className={`site-chrome-row${editing.id === item.id ? " active" : ""}`} onClick={() => edit(item)}><span><strong>{item.label}</strong><small>{item.isVisible ? "Đang hiển thị" : "Đang ẩn"}</small></span><em>{item.sectionKey}.{item.fieldKey}</em><p>{item.value || item.imageUrl || item.url || "Chưa có giá trị"}</p></button>)}{!items.length && <p className="site-content-empty">Chưa có nội dung.</p>}</div></aside>
      <div className="panel site-chrome-editor"><div className="site-content-editor-head"><div><p className="eyebrow">{editing.id ? "CHỈNH SỬA" : "BẢN GHI MỚI"}</p><h2>{editing.label}</h2></div>{editing.id && <button type="button" className="btn btn-danger" onClick={() => void remove()} disabled={busy}><Icon name="trash" size={15} /> Xóa</button>}</div><div className="site-content-form-grid"><label>Section key<input value={editing.sectionKey} onChange={(event) => setField("sectionKey", event.target.value)} /></label><label>Field key<input value={editing.fieldKey} onChange={(event) => setField("fieldKey", event.target.value)} /></label><label className="site-content-full">Nhãn quản trị<input value={editing.label} onChange={(event) => setField("label", event.target.value)} /></label><label className="site-content-full">Giá trị nội dung<textarea rows={4} value={editing.value} onChange={(event) => setField("value", event.target.value)} /></label><label>URL liên kết<input value={editing.url} onChange={(event) => setField("url", event.target.value)} placeholder="https://... hoặc /lien-he" /></label><label>Thứ tự hiển thị<input type="number" value={editing.sortOrder} onChange={(event) => setField("sortOrder", Number(event.target.value))} /></label></div><div className="site-chrome-media"><p className="eyebrow">LOGO / MEDIA</p><div className="site-chrome-media-actions"><button type="button" className="drop" onClick={() => void openLibrary()}><Icon name="image" size={20} /><strong>Chọn từ thư viện</strong></button><input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} /><button type="button" className="drop" onClick={() => inputRef.current?.click()} disabled={busy}><Icon name="upload" size={20} /><strong>{busy ? "Đang tải…" : "Tải ảnh lên"}</strong></button></div>{editing.imageUrl && <div className="site-chrome-media-preview"><img src={editing.imageUrl} alt={editing.altText || editing.label} /><button type="button" className="btn btn-secondary" onClick={() => setField("imageUrl", "")}>Bỏ ảnh</button></div>}{mediaOpen && <div className="site-chrome-library"><div><strong>Thư viện ảnh</strong><button type="button" className="btn btn-secondary" onClick={() => setMediaOpen(false)}>Đóng</button></div>{assets.length ? <div className="site-chrome-library-grid">{assets.map((asset) => <button type="button" key={asset.id} onClick={() => { setField("imageUrl", asset.url); setMediaOpen(false); }}><img src={asset.url} alt={asset.name} /><span>{asset.name}</span></button>)}</div> : <p>Chưa có ảnh trong thư viện.</p>}</div>}</div><div className="site-content-form-grid"><label>Alt text ảnh<input value={editing.altText} onChange={(event) => setField("altText", event.target.value)} /></label><label className="site-chrome-visible"><input type="checkbox" checked={editing.isVisible} onChange={(event) => setField("isVisible", event.target.checked)} /> Hiển thị trên frontend</label></div><div className="site-content-editor-actions"><span className={notice.includes("không") || notice.includes("Không") ? "error" : "success"}>{notice}</span><button type="button" className="btn btn-primary" onClick={() => void save()} disabled={busy}>{busy ? "Đang lưu..." : "Lưu nội dung"}</button></div></div></div>
  </section>;
}
