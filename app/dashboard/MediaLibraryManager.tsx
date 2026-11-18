/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import type { MediaSelection } from "./MediaPicker";

type EditableMedia = MediaSelection & { altText: string; caption: string };

export function MediaLibraryManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<EditableMedia[]>([]);
  const [selected, setSelected] = useState<EditableMedia | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    if (!needle) return assets;
    return assets.filter((asset) =>
      `${asset.name} ${asset.altText} ${asset.caption}`
        .toLocaleLowerCase("vi")
        .includes(needle),
    );
  }, [assets, query]);

  async function refresh(preferredId?: string) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/media", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể tải thư viện media.");
      const nextAssets = (payload.assets || []) as EditableMedia[];
      setAssets(nextAssets);
      setSelected((current) => {
        const targetId = preferredId || current?.id;
        return nextAssets.find((asset) => asset.id === targetId) || nextAssets[0] || null;
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tải thư viện media.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/media", { method: "POST", body });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể tải ảnh lên.");
      const asset = payload as EditableMedia;
      setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
      setSelected(asset);
      setMessage("Đã tải ảnh lên và lưu vào thư viện. Hãy bổ sung alt text trước khi sử dụng.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tải ảnh lên.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function saveMetadata() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/media/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText: selected.altText, caption: selected.caption }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể lưu metadata media.");
      const updated = payload as EditableMedia;
      setAssets((current) => current.map((asset) => (asset.id === updated.id ? updated : asset)));
      setSelected(updated);
      setMessage("Đã cập nhật alt text và caption trong thư viện.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể lưu metadata media.");
    } finally {
      setBusy(false);
    }
  }

  async function archiveSelected() {
    if (!selected || busy) return;
    if (!window.confirm(`Ẩn “${selected.name}” khỏi thư viện? File gốc và các URL đang dùng sẽ được giữ nguyên.`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/media/${selected.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể ẩn media.");
      setAssets((current) => current.filter((asset) => asset.id !== selected.id));
      setSelected(null);
      setMessage("Đã ẩn media khỏi thư viện. File gốc và URL cũ vẫn được bảo toàn.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể ẩn media.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="media-library-manager">
      <input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} />
      <div className="dashboard-view-head cms-title-row">
        <div>
          <p className="eyebrow">THƯ VIỆN TÀI SẢN</p>
          <h1 className="disp">Media</h1>
          <p>Quản lý ảnh gốc, bản WebP tối ưu, alt text và caption dùng lại trên toàn website.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={busy}>
          <Icon name="upload" size={16} /> {busy ? "Đang xử lý…" : "Tải ảnh lên"}
        </button>
      </div>

      {(message || error) ? <div className={`cms-notice ${error ? "error" : "success"}`}>{error || message}</div> : null}

      <div className="media-library-workspace">
        <section className="panel media-library-browser">
          <div className="media-library-toolbar">
            <div className="cms-search">
              <Icon name="search" size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, alt hoặc caption" aria-label="Tìm media" />
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => void refresh()} disabled={loading || busy}>
              <Icon name="history" size={15} /> Làm mới
            </button>
          </div>
          <div className="media-library-summary"><strong>{visible.length}</strong> / {assets.length} tài sản</div>
          {loading ? <p className="cms-empty">Đang tải thư viện…</p> : visible.length ? (
            <div className="media-library-grid">
              {visible.map((asset) => (
                <button type="button" key={asset.id} className={selected?.id === asset.id ? "active" : ""} onClick={() => { setSelected({ ...asset }); setMessage(""); setError(""); }}>
                  <img src={asset.url} alt={asset.altText || asset.name} />
                  <span><strong>{asset.name}</strong><small>{asset.width} × {asset.height}px</small><em className={asset.altText ? "complete" : "missing"}>{asset.altText ? "Đã có alt" : "Thiếu alt"}</em></span>
                </button>
              ))}
            </div>
          ) : <p className="cms-empty">Không có media phù hợp.</p>}
        </section>

        <aside className="panel media-library-editor">
          {selected ? <>
            <div className="site-content-editor-head"><div><p className="eyebrow">METADATA MEDIA</p><h2>{selected.name}</h2></div></div>
            <img className="media-library-preview" src={selected.url} alt={selected.altText || selected.name} />
            <dl className="media-library-details"><div><dt>Kích thước</dt><dd>{selected.width} × {selected.height}px</dd></div><div><dt>ID</dt><dd>{selected.id}</dd></div></dl>
            <label className="field"><span>Alt text <small>{selected.altText.length}/300</small></span><input className="input" maxLength={300} value={selected.altText} onChange={(event) => setSelected((current) => current ? { ...current, altText: event.target.value } : current)} placeholder="Mô tả nội dung và mục đích của ảnh" /></label>
            <label className="field"><span>Caption <small>{selected.caption.length}/500</small></span><textarea className="input" maxLength={500} rows={4} value={selected.caption} onChange={(event) => setSelected((current) => current ? { ...current, caption: event.target.value } : current)} placeholder="Chú thích hiển thị khi vị trí sử dụng hỗ trợ caption" /></label>
            <p className="cms-help">File gốc được giữ nguyên; website phân phối bản WebP tối ưu qua cùng một URL media.</p>
            <div className="media-library-actions"><button type="button" className="btn btn-primary media-library-save" onClick={() => void saveMetadata()} disabled={busy}><Icon name="check" size={16} /> {busy ? "Đang lưu…" : "Lưu alt và caption"}</button><button type="button" className="btn cms-danger" onClick={() => void archiveSelected()} disabled={busy}>Ẩn khỏi thư viện</button></div>
          </> : <p className="cms-empty">Chọn một media để xem và chỉnh metadata.</p>}
        </aside>
      </div>
    </section>
  );
}
