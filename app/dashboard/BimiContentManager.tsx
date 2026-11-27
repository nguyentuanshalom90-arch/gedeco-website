"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listSiteContent, saveSiteContent, deleteSiteContent } from "@/lib/dashboard/site-content-actions";
import type { SiteContentInput, SiteContentItem, SiteContentKind } from "@/lib/dashboard/site-content-types";
import { contentPages } from "@/lib/dashboard/site-content-seed";
import { BimiFrontendPreview, type BimiFrontendPreviewHandle } from "./BimiFrontendPreview";

type ContentRow = SiteContentItem & { rowKind: "content"; contentKind: SiteContentKind };
const pages = [...contentPages];

function isLocked(row: Pick<ContentRow, "sectionKey" | "fieldKey"> | undefined) {
  return Boolean(
    row &&
      (row.sectionKey === "news" || row.sectionKey === "products") &&
      !["title", "heading", "eyebrow", "allLabel"].includes(row.fieldKey)
  );
}

function emptyContent(pageKey: string): SiteContentInput {
  const page = pages.find((item) => item.pageKey === pageKey) || pages[0];
  return {
    pageKey: page.pageKey,
    pageName: page.name,
    route: page.route,
    h1: page.h1,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    canonicalUrl: page.canonicalUrl,
    robotsIndex: true,
    robotsFollow: true,
    sectionKey: "hero",
    fieldKey: "title",
    label: "Tiêu đề nội dung",
    value: "",
    contentType: "TEXT",
    headingLevel: "H2",
    imageUrl: "",
    altText: "",
    imageCaption: "",
    isVisible: true,
    sortOrder: 0,
    englishLabel: "",
    englishValue: "",
    englishAltText: "",
    englishCaption: "",
    englishH1: "",
    englishMetaTitle: "",
    englishMetaDescription: "",
  };
}

export function BimiContentManager({
  initialPageKey = "home",
}: {
  initialArea?: "HEADER" | "FOOTER" | "BODY";
  initialPageKey?: string;
}) {
  const [pageKey, setPageKey] = useState(() =>
    pages.some((page) => page.pageKey === initialPageKey) ? initialPageKey : "home"
  );
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [draft, setDraft] = useState<SiteContentInput>(emptyContent(initialPageKey));
  const [kind, setKind] = useState<SiteContentKind>("dynamic");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  // Ref to call iframe refresh without remounting
  const previewRef = useRef<BimiFrontendPreviewHandle>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [dynamic, statik] = await Promise.all([
        listSiteContent("dynamic"),
        listSiteContent("static"),
      ]);
      setRows([
        ...dynamic.map((item) => ({ ...item, rowKind: "content" as const, contentKind: "dynamic" as const })),
        ...statik.map((item) => ({ ...item, rowKind: "content" as const, contentKind: "static" as const })),
      ]);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể tải nội dung.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "site-content");
    url.searchParams.set("area", "body");
    url.searchParams.set("page", pageKey);
    window.history.replaceState({}, "", url);
  }, [pageKey]);

  const pageRows = useMemo(
    () => rows.filter((row) => row.pageKey === pageKey),
    [pageKey, rows]
  );
  const page = pages.find((item) => item.pageKey === pageKey) || pages[0];
  const locked = isLocked(draft as ContentRow);

  function selectPage(next: string) {
    setPageKey(next);
    setDraft(emptyContent(next));
    setKind("dynamic");
    setNotice("");
  }

  function selectRow(row: ContentRow) {
    setDraft({ ...row });
    setKind(row.contentKind);
    setNotice("");
  }

  function patch(field: string, value: unknown) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    if (locked) {
      setNotice("Card/data động của Tin tức và Sản phẩm chỉ được xem; heading vẫn được chỉnh.");
      return;
    }
    setBusy(true);
    try {
      const result = await saveSiteContent(kind, draft);
      const item = { ...result.item, rowKind: "content" as const, contentKind: kind };
      setRows((current) => [item, ...current.filter((row) => row.id !== item.id)]);
      setDraft({ ...result.item });
      setNotice("Đã lưu nội dung tiếng Việt.");
      // Refresh iframe overlay without hard-reloading the whole iframe
      setTimeout(() => previewRef.current?.refresh(), 500);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể lưu nội dung.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!draft.id || locked) return;
    if (!window.confirm("Xóa nội dung này khỏi thư viện quản lý?")) return;
    setBusy(true);
    try {
      await deleteSiteContent(kind, draft.id);
      setRows((current) => current.filter((row) => row.id !== draft.id));
      setDraft(emptyContent(pageKey));
      setNotice("Đã xóa nội dung.");
      setTimeout(() => previewRef.current?.refresh(), 500);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể xóa nội dung.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bimi-content-manager">
      <div className="bimi-content-heading">
        <small>CMS · BODY</small>
        <h1>Quản lý page</h1>
        <p>
          Click trực tiếp vào vùng text hoặc ảnh trên page frontend để tùy biến và quản lý page. Header/Footer không thuộc module này.
        </p>
      </div>
      <section className="bimi-content-panel bimi-body-customizer">
        <h2>{page.name} · Body frontend</h2>
        <p>Chọn page, sau đó click đúng vùng cần chỉnh trong bản xem trước.</p>
        <nav className="bimi-content-pages" aria-label="Các page trong Body">
          {pages.map((item) => (
            <button
              key={item.pageKey}
              type="button"
              className={item.pageKey === pageKey ? "active" : ""}
              onClick={() => selectPage(item.pageKey)}
            >
              {item.name}
            </button>
          ))}
        </nav>
        <BimiFrontendPreview
          ref={previewRef}
          key={pageKey}
          route={page.route}
          pageName={page.name}
          rows={pageRows}
          activeRow={draft}
          locked={locked}
          busy={busy}
          notice={notice}
          onSelectRow={(row) => {
            const found = pageRows.find((item) => item.id === row.id);
            if (found) selectRow(found);
          }}
          onLocked={() =>
            setNotice(
              "Card/data động của Tin tức và Sản phẩm chỉ được xem; không thể chỉnh sửa tại đây."
            )
          }
          onPatch={patch}
          onSave={() => void save()}
          onDelete={() => void remove()}
        />
      </section>
    </section>
  );
}
