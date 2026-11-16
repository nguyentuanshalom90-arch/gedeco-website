/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
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
};

export function MediaPicker({ label, value, altText = "", caption = "", onSelect, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaSelection[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function openLibrary() {
    setLibraryOpen(true);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/media");
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể tải thư viện media.");
      setAssets(payload.assets || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tải thư viện media.");
    } finally {
      setBusy(false);
    }
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
      onSelect(payload as MediaSelection);
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
      {value ? <div className="cms-image-preview"><img src={value} alt={altText || label} /><button type="button" onClick={onClear} aria-label={`Bỏ ${label}`}><Icon name="trash" size={15} /></button></div> : null}
      <div className="cms-image-actions">
        <button type="button" className="drop" onClick={() => void openLibrary()} disabled={busy}><Icon name="image" size={20} /><strong>Chọn từ thư viện</strong></button>
        <button type="button" className="drop" onClick={() => inputRef.current?.click()} disabled={busy}><Icon name="upload" size={20} /><strong>{busy ? "Đang xử lý…" : "Tải ảnh lên"}</strong></button>
      </div>
      {error ? <p className="cms-help error">{error}</p> : null}
      {libraryOpen ? <div className="post-media-library">
        <div className="post-media-library-head"><strong>Thư viện media</strong><button type="button" className="btn" onClick={() => setLibraryOpen(false)}>Đóng</button></div>
        {busy ? <p>Đang tải ảnh…</p> : assets.length ? <div className="post-media-grid">{assets.map((asset) => <button type="button" key={asset.id} onClick={() => { onSelect(asset); setLibraryOpen(false); }}><img src={asset.url} alt={asset.altText || asset.name} /><span>{asset.name}</span></button>)}</div> : <p>Chưa có ảnh trong thư viện.</p>}
      </div> : null}
    </div>
  );
}
