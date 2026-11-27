"use client";

import { useId, useMemo, useRef, useState, useEffect } from "react";

export type MediaAsset = {
  id: string;
  name: string;
  url: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
};

export function BimiMediaModal({
  open,
  title = "Chọn ảnh cho trang",
  currentUrl,
  altText = "",
  caption = "",
  onSelect,
  onClose,
}: {
  open: boolean;
  title?: string;
  currentUrl?: string;
  altText?: string;
  caption?: string;
  onSelect: (asset: MediaAsset) => void;
  onClose: () => void;
}) {
  const [source, setSource] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  useEffect(() => {
    if (!open) return;
    setSource("library");
    setBusy(true);
    setError("");
    fetch("/api/media", { cache: "no-store" })
      .then((r) => r.json().catch(() => ({})))
      .then((payload) => {
        setAssets(payload.assets || []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không thể tải thư viện media.");
      })
      .finally(() => setBusy(false));
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? assets.filter((asset) => `${asset.name} ${asset.url}`.toLowerCase().includes(q))
      : assets;
  }, [assets, query]);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("altText", altText);
      form.append("caption", caption);
      const res = await fetch("/api/media", { method: "POST", body: form });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Không thể tải ảnh lên.");
      onSelect(payload as MediaAsset);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tải ảnh lên.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  if (!open) return null;

  return (
    <div
      className="bimi-media-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        .bimi-media-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999999;
          background: rgba(10, 20, 35, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: bimi-modal-fade .18s ease-out;
        }
        @keyframes bimi-modal-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .bimi-media-modal-card {
          width: 100%;
          max-width: 720px;
          max-height: 85vh;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: bimi-modal-pop .2s ease-out;
        }
        @keyframes bimi-modal-pop {
          from { transform: scale(0.96) translateY(8px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .bimi-media-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .bimi-media-modal-header h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: #111827;
        }
        .bimi-media-modal-close {
          border: 0;
          background: transparent;
          font-size: 22px;
          color: #6b7280;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 8px;
        }
        .bimi-media-modal-close:hover {
          background: #f3f4f6;
          color: #111827;
        }
        .bimi-media-modal-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 20px;
          gap: 16px;
          background: #fff;
        }
        .bimi-media-modal-tab {
          border: 0;
          background: transparent;
          padding: 12px 4px;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          border-bottom: 2px solid transparent;
          cursor: pointer;
        }
        .bimi-media-modal-tab.active {
          color: #0f7040;
          border-bottom-color: #0f7040;
        }
        .bimi-media-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .bimi-media-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          background: #f9fafb;
          transition: border-color .15s;
        }
        .bimi-media-upload-area:hover {
          border-color: #0f7040;
        }
        .bimi-media-upload-icon {
          font-size: 42px;
          margin-bottom: 12px;
          display: block;
        }
        .bimi-media-upload-btn {
          border: 0;
          border-radius: 8px;
          padding: 10px 22px;
          background: #0f7040;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          margin-top: 14px;
        }
        .bimi-media-upload-btn:hover { background: #0a5c35; }
        .bimi-media-modal-search {
          box-sizing: border-box;
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 9px 14px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .bimi-media-modal-search:focus {
          outline: 2px solid #0f7040;
          border-color: transparent;
        }
        .bimi-media-grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
        }
        .bimi-media-card-btn {
          border: 2px solid transparent;
          border-radius: 10px;
          overflow: hidden;
          background: #f3f4f6;
          padding: 0;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          text-align: left;
          transition: transform .12s, border-color .12s;
        }
        .bimi-media-card-btn:hover {
          transform: translateY(-2px);
          border-color: #0f7040;
          box-shadow: 0 4px 12px rgba(15,112,64,.2);
        }
        .bimi-media-card-btn.selected {
          border-color: #0f7040;
          box-shadow: 0 0 0 2px #0f7040;
        }
        .bimi-media-card-btn img {
          width: 100%;
          height: 100px;
          object-fit: cover;
          display: block;
        }
        .bimi-media-card-btn span {
          padding: 6px 8px;
          font-size: 11px;
          color: #374151;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: #fff;
        }
        .bimi-media-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .bimi-media-modal-cancel {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 16px;
          background: #fff;
          color: #374151;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={upload}
      />

      <div className="bimi-media-modal-card">
        <div className="bimi-media-modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="bimi-media-modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="bimi-media-modal-tabs">
          <button
            type="button"
            className={`bimi-media-modal-tab ${source === "library" ? "active" : ""}`}
            onClick={() => setSource("library")}
          >
            🖼️ Chọn từ thư viện
          </button>
          <button
            type="button"
            className={`bimi-media-modal-tab ${source === "upload" ? "active" : ""}`}
            onClick={() => setSource("upload")}
          >
            ⬆️ Tải ảnh lên
          </button>
        </div>

        <div className="bimi-media-modal-body">
          {error && <p style={{ color: "#b42318", fontSize: "13px" }}>{error}</p>}

          {source === "upload" ? (
            <div className="bimi-media-upload-area">
              <span className="bimi-media-upload-icon">📁</span>
              <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#111827" }}>
                Tải ảnh mới từ máy tính của bạn
              </p>
              <small style={{ color: "#6b7280" }}>
                Hỗ trợ định dạng PNG, JPG, WEBP, SVG
              </small>
              <div>
                <button
                  type="button"
                  className="bimi-media-upload-btn"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                >
                  {busy ? "Đang xử lý tải lên…" : "Chọn ảnh từ máy tính"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input
                id={searchId}
                className="bimi-media-modal-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm ảnh theo tên hoặc URL..."
              />
              {busy ? (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
                  Đang tải thư viện media…
                </p>
              ) : filtered.length === 0 ? (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
                  Chưa có ảnh nào phù hợp. Bạn có thể bấm &quot;Tải ảnh lên&quot; để thêm ảnh mới.
                </p>
              ) : (
                <div className="bimi-media-grid-view">
                  {filtered.map((asset) => {
                    const isSelected = currentUrl && asset.url.includes(currentUrl.split("/").pop() || "");
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        className={`bimi-media-card-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          onSelect(asset);
                          onClose();
                        }}
                      >
                        <img src={asset.url} alt={asset.altText || asset.name} />
                        <span>{asset.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bimi-media-modal-footer">
          <button type="button" className="bimi-media-modal-cancel" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
