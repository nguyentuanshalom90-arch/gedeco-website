"use client";

import { useId, useMemo, useRef, useState } from "react";

type Asset = { id: string; name: string; url: string; width: number; height: number; altText: string; caption: string };

export function BimiMediaSourcePicker({ value, altText, caption, onSelect, onClear, disabled = false }: { value: string; altText: string; caption: string; onSelect: (asset: Asset) => void; onClear: () => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return q ? assets.filter((asset) => `${asset.name} ${asset.url}`.toLowerCase().includes(q)) : assets; }, [assets, query]);

  async function openPicker() {
    setOpen(true); setSource("library"); setBusy(true); setError("");
    try { const response = await fetch("/api/media", { cache: "no-store" }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || "Không thể tải thư viện media."); setAssets(payload.assets || []); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể tải thư viện media."); }
    finally { setBusy(false); }
  }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; setBusy(true); setError("");
    try { const form = new FormData(); form.append("file", file); form.append("altText", altText); form.append("caption", caption); const response = await fetch("/api/media", { method: "POST", body: form }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || "Không thể tải ảnh lên."); onSelect(payload as Asset); setOpen(false); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể tải ảnh lên."); }
    finally { setBusy(false); event.target.value = ""; }
  }
  return <div className="bimi-media-picker">
    <input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} />
    {value ? <div className="bimi-media-current"><img src={value} alt={altText || "Media đã chọn"} /><div><strong>Media đang dùng</strong><small>{value}</small></div><button type="button" onClick={onClear}>Bỏ chọn</button></div> : <p className="bimi-media-empty">Chưa có asset riêng; frontend sẽ dùng giá trị mặc định nếu có.</p>}
    <button type="button" className="bimi-media-trigger" onClick={() => void openPicker()} disabled={disabled || busy}><span>Chọn file</span><span>{value || "No file chosen"}</span></button>
    {open ? <div className="bimi-media-panel" role="dialog" aria-label="Chọn media">
      <div className="bimi-media-panel-head"><strong>Chèn media</strong><button type="button" onClick={() => setOpen(false)} aria-label="Đóng">×</button></div>
      <div className="bimi-media-source-tabs" role="tablist"><button type="button" className={source === "library" ? "active" : ""} onClick={() => setSource("library")}>Chọn từ thư viện</button><button type="button" className={source === "upload" ? "active" : ""} onClick={() => setSource("upload")}>Tải ảnh lên</button></div>
      {source === "upload" ? <div className="bimi-media-upload"><p>Tải ảnh mới lên thư viện Gedeco để có thể dùng lại.</p><button type="button" className="bimi-content-primary" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? "Đang xử lý…" : "Chọn ảnh từ máy tính"}</button></div> : <div className="bimi-media-library"><label htmlFor={searchId}>Tìm kiếm media</label><input id={searchId} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên hoặc URL..." />{error ? <p className="bimi-content-error">{error}</p> : null}{busy ? <p>Đang tải thư viện…</p> : <div className="bimi-media-grid">{filtered.map((asset) => <button key={asset.id} type="button" onClick={() => { onSelect(asset); setOpen(false); }}><img src={asset.url} alt={asset.altText || asset.name} /><span>{asset.name}</span></button>)}{!filtered.length ? <p>Chưa có media phù hợp.</p> : null}</div>}</div>}
      <div className="bimi-media-panel-foot"><button type="button" onClick={() => setOpen(false)}>Hủy</button></div>
    </div> : null}
  </div>;
}
