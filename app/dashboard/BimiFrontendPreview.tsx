"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SiteContentItem } from "@/lib/dashboard/site-content-types";
import { BimiMediaModal, type MediaAsset } from "./BimiMediaModal";

type PreviewRow = Pick<
  SiteContentItem,
  | "id"
  | "label"
  | "value"
  | "imageUrl"
  | "altText"
  | "imageCaption"
  | "sectionKey"
  | "fieldKey"
  | "contentType"
  | "isVisible"
>;

export type BimiFrontendPreviewHandle = {
  refresh: () => void;
};

type Props = {
  route: string;
  pageName: string;
  rows: PreviewRow[];
  notice?: string;
  busy?: boolean;
  onRefresh?: () => void;
  // Kept for backward compatibility if parent passes them
  activeRow?: unknown;
  locked?: boolean;
  onSelectRow?: (row: PreviewRow) => void;
  onLocked?: () => void;
  onPatch?: (field: string, value: unknown) => void;
  onSave?: () => void;
  onDelete?: () => void;
};

const BimiFrontendPreviewInner = forwardRef<BimiFrontendPreviewHandle, Props>(
  function BimiFrontendPreview(
    { route, pageName },
    ref
  ) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [editMode, setEditMode] = useState(true);
    const [dirtyCount, setDirtyCount] = useState(0);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

    // Media modal state
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<{
      id: string;
      label?: string;
      currentUrl?: string;
      altText?: string;
      caption?: string;
    } | null>(null);

    const src = useMemo(() => {
      // Keep the preview iframe same-origin with the dashboard. Building an
      // absolute SSR URL (127.0.0.1) makes the iframe lose the dashboard
      // session cookie when the dashboard was opened via localhost (or the
      // production canonical host), so inline-save/media requests return 401.
      const url = new URL(route || "/", "http://cms-preview.invalid");
      url.searchParams.set("cmsPreview", "1");
      return `${url.pathname}${url.search}${url.hash}`;
    }, [route]);

    /* ── Expose refresh() to parent via ref ─────────────────── */
    useImperativeHandle(ref, () => ({
      refresh() {
        const win = iframeRef.current?.contentWindow;
        if (!win) return;
        setIframeLoading(true);
        win.postMessage({ type: "gedeco-cms-refresh" }, "*");
        const t = setTimeout(() => {
          if (iframeRef.current) {
            const s = iframeRef.current.src;
            iframeRef.current.src = "";
            iframeRef.current.src = s;
          }
        }, 2500);
        return () => clearTimeout(t);
      },
    }));

    /* ── Message communication with iframe ──────────────────── */
    const handleMessage = useCallback((event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === "gedeco-cms-ready") {
        setIframeLoading(false);
      }

      if (event.data.type === "gedeco-cms-dirty") {
        setDirtyCount(event.data.count || 0);
      }

      if (event.data.type === "gedeco-cms-pick-media") {
        setMediaTarget({
          id: event.data.id,
          label: event.data.label,
          currentUrl: event.data.currentUrl,
          altText: event.data.altText,
          caption: event.data.caption,
        });
        setMediaModalOpen(true);
      }

      if (event.data.type === "gedeco-cms-saved") {
        setSaving(false);
        setDirtyCount(0);
        setToast({ msg: "Đã lưu tất cả thay đổi thành công!", type: "ok" });
        setTimeout(() => setToast(null), 3000);
      }

      if (event.data.type === "gedeco-cms-mode-changed") {
        setEditMode(Boolean(event.data.active));
      }
    }, []);

    useEffect(() => {
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, [handleMessage]);

    /* ── Toggle edit mode in iframe ─────────────────────────── */
    function toggleEditMode() {
      const next = !editMode;
      setEditMode(next);
      iframeRef.current?.contentWindow?.postMessage(
        { type: "gedeco-cms-toggle-mode", active: next },
        "*"
      );
    }

    /* ── Trigger save in iframe ─────────────────────────────── */
    function triggerSave() {
      setSaving(true);
      iframeRef.current?.contentWindow?.postMessage(
        { type: "gedeco-cms-trigger-save" },
        "*"
      );
    }

    /* ── Handle media select from modal ─────────────────────── */
    function handleMediaSelect(asset: MediaAsset) {
      if (!mediaTarget) return;
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "gedeco-cms-media-picked",
          id: mediaTarget.id,
          url: asset.url,
          altText: asset.altText || mediaTarget.altText,
          caption: asset.caption || mediaTarget.caption,
        },
        "*"
      );
      setMediaModalOpen(false);
      setMediaTarget(null);
    }

    /* ── Track iframe load ───────────────────────────────────── */
    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const onLoad = () => {
        setTimeout(() => setIframeLoading(false), 2000);
      };
      iframe.addEventListener("load", onLoad);
      return () => iframe.removeEventListener("load", onLoad);
    }, []);

    return (
      <section className="bimi-frontend-preview" aria-label={`Trình tùy biến frontend ${pageName}`}>
        <style>{`
          .bimi-frontend-preview {
            display: grid;
            gap: 12px;
            margin-top: 14px;
            padding: 16px;
            border: 1px solid #d8d2ef;
            border-radius: 16px;
            background: #f8faf9;
          }
          .bimi-fp-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .bimi-fp-title-area small {
            color: #0f7040;
            font-weight: 800;
            letter-spacing: .12em;
            font-size: 11px;
            text-transform: uppercase;
          }
          .bimi-fp-title-area h3 {
            margin: 2px 0 4px;
            color: #17133c;
            font-size: 20px;
            font-weight: 800;
          }
          .bimi-fp-title-area p {
            margin: 0;
            color: #64748b;
            font-size: 13px;
          }
          .bimi-fp-actions-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .bimi-btn-edit-mode {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border: 1.5px solid #0f7040;
            border-radius: 999px;
            padding: 9px 18px;
            background: #fff;
            color: #0f7040;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            transition: all .15s ease;
          }
          .bimi-btn-edit-mode.active {
            background: #0f7040;
            color: #fff;
            box-shadow: 0 4px 12px rgba(15,112,64,.25);
          }
          .bimi-btn-edit-mode:hover {
            transform: translateY(-1px);
          }
          .bimi-btn-save-inline {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border: 0;
            border-radius: 999px;
            padding: 9px 20px;
            background: #2563eb;
            color: #fff;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37,99,235,.25);
            transition: all .15s ease;
          }
          .bimi-btn-save-inline:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
          }
          .bimi-btn-save-inline:disabled {
            opacity: .45;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .bimi-fp-open-link {
            border: 1px solid #d8d2ef;
            border-radius: 999px;
            padding: 8px 14px;
            background: #fff;
            color: #0f7040;
            font-weight: 700;
            font-size: 12px;
            text-decoration: none;
            white-space: nowrap;
          }
          .bimi-fp-open-link:hover {
            background: #f0fdf4;
          }
          .bimi-fp-toast {
            font-size: 13px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 999px;
            animation: bimi-toast-in .2s ease-out;
          }
          .bimi-fp-toast.ok {
            background: #dcfce7;
            color: #166534;
          }
          .bimi-fp-toast.err {
            background: #fee2e2;
            color: #991b1b;
          }
          @keyframes bimi-toast-in {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .bimi-fp-frame-wrap {
            position: relative;
            overflow: hidden;
            border: 1px solid #d8d2ef;
            border-radius: 12px;
            background: #fff;
          }
          .bimi-fp-frame {
            display: block;
            width: 100%;
            height: 780px;
            border: 0;
          }
          .bimi-fp-loading {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: rgba(248,250,249,.92);
            font-size: 13px;
            color: #64748b;
            pointer-events: none;
            border-radius: 12px;
          }
          .bimi-fp-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #d8d2ef;
            border-top-color: #0f7040;
            border-radius: 50%;
            animation: bimi-spin .8s linear infinite;
          }
          @keyframes bimi-spin {
            to { transform: rotate(360deg); }
          }
          @media (max-width: 768px) {
            .bimi-fp-toolbar {
              flex-direction: column;
              align-items: stretch;
            }
            .bimi-fp-actions-row {
              flex-wrap: wrap;
            }
            .bimi-fp-frame {
              height: 600px;
            }
          }
        `}</style>

        {/* ── Toolbar Header ── */}
        <div className="bimi-fp-toolbar">
          <div className="bimi-fp-title-area">
            <small>BODY · TRÌNH TÙY BIẾN TRỰC QUAN</small>
            <h3>{pageName} · Chỉnh sửa trực tiếp</h3>
            <p>
              Bấm &quot;Điều chỉnh&quot; để hiện khung xanh: click trực tiếp vào text để gõ sửa, click vào ảnh để thay ảnh.
            </p>
          </div>

          <div className="bimi-fp-actions-row">
            {toast && (
              <span className={`bimi-fp-toast ${toast.type}`}>
                {toast.msg}
              </span>
            )}

            <button
              type="button"
              className={`bimi-btn-edit-mode ${editMode ? "active" : ""}`}
              onClick={toggleEditMode}
            >
              {editMode ? "✓ Đang bật điều chỉnh" : "✏️ Bật điều chỉnh"}
            </button>

            <button
              type="button"
              className="bimi-btn-save-inline"
              onClick={triggerSave}
              disabled={saving || dirtyCount === 0}
            >
              {saving
                ? "Đang lưu…"
                : dirtyCount > 0
                ? `💾 Lưu thay đổi (${dirtyCount})`
                : "💾 Lưu thay đổi"}
            </button>

            <a
              href={route || "/"}
              target="_blank"
              rel="noreferrer"
              className="bimi-fp-open-link"
            >
              Mở frontend ↗
            </a>
          </div>
        </div>

        {/* ── Full Iframe Preview ── */}
        <div className="bimi-fp-frame-wrap">
          {iframeLoading && (
            <div className="bimi-fp-loading">
              <div className="bimi-fp-spinner" />
              <span>Đang tải trang xem trước…</span>
            </div>
          )}
          <iframe
            ref={iframeRef}
            title={`Frontend ${pageName}`}
            src={src}
            className="bimi-fp-frame"
          />
        </div>

        {/* ── Media Picker Modal (when clicking an image in iframe) ── */}
        <BimiMediaModal
          open={mediaModalOpen}
          title={`Thay ảnh: ${mediaTarget?.label || "Ảnh nội dung"}`}
          currentUrl={mediaTarget?.currentUrl}
          altText={mediaTarget?.altText}
          caption={mediaTarget?.caption}
          onSelect={handleMediaSelect}
          onClose={() => {
            setMediaModalOpen(false);
            setMediaTarget(null);
          }}
        />
      </section>
    );
  }
);

BimiFrontendPreviewInner.displayName = "BimiFrontendPreview";

export { BimiFrontendPreviewInner as BimiFrontendPreview };
