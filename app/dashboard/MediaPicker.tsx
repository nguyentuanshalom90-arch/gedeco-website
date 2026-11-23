/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/vimigo-icon";

export type MediaSelection = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  altText: string;
  caption: string;
};

type Props = {
  label: string;
  value: string;
  altText?: string;
  caption?: string;
  onSelect: (asset: MediaSelection) => void;
  onClear?: () => void;
  triggerOnly?: boolean;
  autoOpen?: boolean;
  onClose?: () => void;
};

export function MediaPicker({ label, value, altText = "", caption = "", onSelect, onClear, triggerOnly = false, autoOpen = false, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaSelection[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "library">("library");
  const [query, setQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaSelection | null>(null);

  useEffect(() => {
    if (autoOpen) void openLibrary();
  }, [autoOpen]);

  async function openLibrary() {
    setLibraryOpen(true);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/media", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể tải thư viện media.");
      setAssets(payload.assets || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tải thư viện media.");
    } finally {
      setBusy(false);
    }
  }

  function closeLibrary() {
    setLibraryOpen(false);
    setSelectedAsset(null);
    setQuery("");
    onClose?.();
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("altText", altText);
      body.append("caption", caption);
      const response = await fetch("/api/media", { method: "POST", body });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể tải ảnh lên.");
      const asset = payload as MediaSelection;
      if (triggerOnly) {
        setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
        setSelectedAsset(asset);
        setActiveTab("library");
      } else {
        onSelect(asset);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tải ảnh lên.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <div className="cms-image-picker product-media-picker">
      <input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} />
      {!triggerOnly ? (value ? <div className="cms-image-preview"><img src={value} alt={altText || label} /><button type="button" onClick={onClear} aria-label={`Bỏ ${label}`}><Icon name="trash" size={15} /></button></div> : <div className="cms-image-empty" aria-label={`Chưa chọn ${label}`}>Chưa chọn ảnh<br />Hãy chọn từ thư viện hoặc tải ảnh lên</div>) : null}
      {!triggerOnly ? <div className="cms-image-actions">
        <button type="button" className="drop" onClick={() => void openLibrary()} disabled={busy}><Icon name="image" size={20} /><strong>Chọn từ thư viện</strong></button>
        <button type="button" className="drop" onClick={() => inputRef.current?.click()} disabled={busy}><Icon name="upload" size={20} /><strong>{busy ? "Đang xử lý…" : "Tải ảnh lên"}</strong></button>
      </div> : null}
      {error ? <p className="cms-help error">{error}</p> : null}
      {libraryOpen ? createPortal(<div className="post-media-library" role="dialog" aria-modal="true" aria-label="Thư viện media">
        <div className="post-media-library-head"><strong>Chèn tập tin</strong><button type="button" className="btn" aria-label="Đóng thư viện media" onClick={closeLibrary}>×</button></div>
        <div className="post-media-library-body">
          <aside className="post-media-library-sidebar"><strong>Hành động</strong><button type="button" className={activeTab === "upload" ? "is-active" : ""} onClick={() => setActiveTab("upload")}>Tải lên tệp mới</button><button type="button" className={activeTab === "library" ? "is-active" : ""} onClick={() => setActiveTab("library")}>Tất cả tập tin</button><button type="button">Tạo thư viện ảnh</button><button type="button">Tạo danh sách phát âm thanh</button><button type="button">Ảnh đại diện</button><button type="button">Chèn từ URL</button></aside>
          <section className="post-media-library-main">
            <div className="post-media-library-tabs"><button type="button" className={activeTab === "upload" ? "is-active" : ""} onClick={() => setActiveTab("upload")}>Tải lên tệp mới</button><button type="button" className={activeTab === "library" ? "is-active" : ""} onClick={() => setActiveTab("library")}>Tất cả tập tin</button></div>
            {activeTab === "upload" ? <div className="post-media-upload-panel"><h3>Tải lên tệp mới</h3><p>Chọn ảnh từ máy tính để lưu vào thư viện media.</p><button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={busy}><Icon name="upload" size={18} /> {busy ? "Đang xử lý…" : "Chọn tệp"}</button></div> : <><div className="post-media-library-filters"><label>Lọc theo loại<select><option>Tất cả</option><option>Hình ảnh</option></select></label><label>Lọc theo ngày<select><option>Tất cả các ngày</option></select></label><label className="post-media-search">Tìm tệp<input value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>{busy ? <p>Đang tải ảnh…</p> : <div className="post-media-grid">{assets.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase())).map((asset) => <button type="button" key={asset.id} aria-label={`Chọn media ${asset.name}`} className={selectedAsset?.id === asset.id ? "is-selected" : ""} onClick={() => setSelectedAsset(asset)}><img src={asset.url} alt={asset.altText || asset.name} /><span>{asset.name}</span></button>)}</div>}</>}
          </section>
        </div>
        <div className="post-media-library-footer"><button type="button" className="btn" onClick={closeLibrary}>Hủy</button><button type="button" className="btn btn-primary" disabled={!selectedAsset} onClick={() => { if (selectedAsset) onSelect(selectedAsset); closeLibrary(); }}>Chèn vào bài viết</button></div>
      </div>, document.querySelector(".lw.vimigo") || document.body) : null}
    </div>
  );
}
