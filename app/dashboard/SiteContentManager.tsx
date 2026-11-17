"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { deleteSiteContent, listSiteContent, saveSiteContent } from "@/lib/dashboard/site-content-actions";
import { contentPages } from "@/lib/dashboard/site-content-seed";
import type { SiteContentInput, SiteContentItem, SiteContentKind } from "@/lib/dashboard/site-content-types";
import { MediaPicker } from "./MediaPicker";

const pageTabs = contentPages.map((page) => ({
  pageKey: page.pageKey,
  pageName: page.name,
  route: page.route,
}));

function emptyItem(pageKey = "home"): SiteContentInput {
  const page = pageTabs.find((item) => item.pageKey === pageKey) || pageTabs[0];
  return {
    pageKey: page.pageKey,
    pageName: page.pageName,
    route: page.route,
    h1: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "/",
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
  };
}

function withPageMetadata(input: SiteContentInput, items: SiteContentItem[]): SiteContentInput {
  const source = items.find((item) => item.pageKey === input.pageKey);
  return source ? { ...input, pageName: source.pageName, route: source.route, h1: source.h1, metaTitle: source.metaTitle, metaDescription: source.metaDescription, canonicalUrl: source.canonicalUrl, robotsIndex: source.robotsIndex, robotsFollow: source.robotsFollow } : input;
}

export function SiteContentManager() {
  const [kind, setKind] = useState<SiteContentKind>("dynamic");
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [selectedPage, setSelectedPage] = useState("home");
  const [editing, setEditing] = useState<SiteContentInput>(emptyItem("home"));
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function load(nextKind = kind) {
    setBusy(true);
    try {
      const rows = await listSiteContent(nextKind);
      setItems(rows);
      setEditing((current) => current.id ? current : withPageMetadata(emptyItem(current.pageKey), rows));
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể tải nội dung.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { void load(kind); }, [kind]);

  const sections = useMemo(() => [...new Set(items.filter((item) => item.pageKey === selectedPage).map((item) => item.sectionKey))].sort((a, b) => a.localeCompare(b)), [items, selectedPage]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesPage = item.pageKey === selectedPage;
      const haystack = `${item.pageName} ${item.sectionKey} ${item.fieldKey} ${item.label} ${item.value}`.toLowerCase();
      const matchesSection = sectionFilter === "all" || item.sectionKey === sectionFilter;
      return matchesPage && matchesSection && (!query || haystack.includes(query));
    });
  }, [items, search, sectionFilter, selectedPage]);

  function edit(item: SiteContentItem) {
    setEditing({ ...item });
    setNotice("");
  }

  function createNew() {
    setEditing(withPageMetadata(emptyItem(selectedPage), items));
    setNotice("");
  }

  function selectPage(pageKey: string) {
    setSelectedPage(pageKey);
    setEditing(withPageMetadata(emptyItem(pageKey), items));
    setSearch("");
    setSectionFilter("all");
    setNotice("");
  }

  function setField<K extends keyof SiteContentInput>(field: K, value: SiteContentInput[K]) {
    setEditing((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    setBusy(true);
    try {
      const result = await saveSiteContent(kind, editing);
      setItems((current) => [result.item, ...current.filter((item) => item.id !== result.item.id)]);
      setEditing({ ...result.item });
      setNotice(`Đã lưu nội dung và SEO. English: ${result.translation.status === "TRANSLATED" ? "đã sinh" : result.translation.status === "FAILED" ? "dịch lỗi — bản cũ được giữ nguyên" : "cần rà soát"}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể lưu nội dung.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!editing.id || !window.confirm("Xóa nội dung này khỏi thư viện quản lý?")) return;
    setBusy(true);
    try {
      await deleteSiteContent(kind, editing.id);
      setItems((current) => current.filter((item) => item.id !== editing.id));
      createNew();
      setNotice("Đã xóa nội dung.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể xóa nội dung.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="site-content-manager">
      <div className="dashboard-view-head cms-title-row">
        <div>
          <p className="eyebrow">CMS TOÀN WEBSITE</p>
          <h1 className="disp">Quản lý body</h1>
          <p>Quản lý toàn bộ nội dung body theo từng page từ database, gồm nội dung theo section, media và metadata SEO.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={createNew}><Icon name="plus" size={16} /> Thêm nội dung</button>
      </div>

      <div className="site-content-page-tabs panel" role="tablist" aria-label="Các page của website">
        {pageTabs.map((page) => <button type="button" role="tab" aria-selected={selectedPage === page.pageKey} className={selectedPage === page.pageKey ? "active" : ""} onClick={() => selectPage(page.pageKey)} key={page.pageKey}><strong>{page.pageName}</strong><small>{page.route}</small></button>)}
      </div>

      <div className="site-content-tabs panel" role="tablist" aria-label={`Loại nội dung page ${pageTabs.find((page) => page.pageKey === selectedPage)?.pageName || ""}`}>
        <button type="button" role="tab" aria-selected={kind === "dynamic"} className={kind === "dynamic" ? "active" : ""} onClick={() => { setKind("dynamic"); setSectionFilter("all"); setEditing(withPageMetadata(emptyItem(selectedPage), items)); }}>
          <Icon name="database" size={17} />
          <span><strong>Nội dung theo section</strong><small>Dữ liệu thay đổi thường xuyên trong database</small></span>
        </button>
        <button type="button" role="tab" aria-selected={kind === "static"} className={kind === "static" ? "active" : ""} onClick={() => { setKind("static"); setSectionFilter("all"); setEditing(withPageMetadata(emptyItem(selectedPage), items)); }}>
          <Icon name="code" size={17} />
          <span><strong>Nội dung nền</strong><small>Nhãn và thành phần giao diện trong database</small></span>
        </button>
      </div>

      <div className="site-content-workspace">
        <aside className="panel site-content-list">
          <div className="site-content-list-head">
            <div><strong>{visibleItems.length} nội dung</strong><small>{pageTabs.find((page) => page.pageKey === selectedPage)?.pageName} · {kind === "dynamic" ? "Nội dung động" : "Nội dung tĩnh"}</small></div>
            <button type="button" className="btn btn-secondary" onClick={() => void load()} disabled={busy}><Icon name="history" size={15} /> Làm mới</button>
          </div>
          <div className="site-content-filters"><input className="site-content-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nhãn hoặc nội dung..." aria-label="Tìm nội dung" /><select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} aria-label="Lọc theo section"><option value="all">Tất cả section ({sections.length})</option>{sections.map((section) => <option value={section} key={section}>{section}</option>)}</select></div>
          <div className="site-content-list-items">
            {visibleItems.map((item) => <button type="button" key={item.id} className={`site-content-row${editing.id === item.id ? " active" : ""}`} onClick={() => edit(item)}>
              <span className="site-content-row-top"><strong>{item.label}</strong><small>{item.isVisible ? "Đang hiển thị" : "Đang ẩn"}</small></span>
              <span className="site-content-row-meta">{item.pageName} · {item.sectionKey}.{item.fieldKey}</span>
              <span className="site-content-row-value">{item.value.replace(/\n/g, " ") || (item.imageUrl ? `Ảnh: ${item.imageUrl}` : "Chưa có giá trị")}</span>
            </button>)}
            {!visibleItems.length && <p className="site-content-empty">Chưa có nội dung phù hợp.</p>}
          </div>
        </aside>

        <div className="panel site-content-editor">
          <div className="site-content-editor-head">
            <div><p className="eyebrow">{editing.id ? "CHỈNH SỬA BẢN GHI" : "BẢN GHI MỚI"}</p><h2>{editing.label || "Nội dung website"}</h2></div>
            {editing.id && <button type="button" className="btn btn-danger" onClick={() => void remove()} disabled={busy}><Icon name="trash" size={15} /> Xóa</button>}
          </div>
          <div className="site-content-form-grid">
            <label>Page key<input value={editing.pageKey} onChange={(event) => setField("pageKey", event.target.value)} /></label>
            <label>Tên page<input value={editing.pageName} onChange={(event) => setField("pageName", event.target.value)} /></label>
            <label>Route<input value={editing.route} onChange={(event) => setField("route", event.target.value)} placeholder="/gioi-thieu" /></label>
            <label>Section key<input value={editing.sectionKey} onChange={(event) => setField("sectionKey", event.target.value)} /></label>
            <label>Field key<input value={editing.fieldKey} onChange={(event) => setField("fieldKey", event.target.value)} /></label>
            <label>Nhãn quản trị<input value={editing.label} onChange={(event) => setField("label", event.target.value)} /></label>
            <label>Kiểu dữ liệu<select value={editing.contentType} onChange={(event) => setField("contentType", event.target.value)}><option value="TEXT">Text</option><option value="RICH_TEXT">Rich text</option><option value="IMAGE">Ảnh</option><option value="LINK">Liên kết</option><option value="NUMBER">Số</option><option value="BOOLEAN">Boolean</option></select></label>
            <label>Heading level<select value={editing.headingLevel} onChange={(event) => setField("headingLevel", event.target.value)}><option value="">Không phải heading</option><option value="H1">H1 — duy nhất mỗi page</option><option value="H2">H2 — section chính</option><option value="H3">H3 — nhóm nội dung</option><option value="H4">H4 — chi tiết</option></select></label>
            <label className="site-content-full">Giá trị nội dung<textarea rows={5} value={editing.value} onChange={(event) => setField("value", event.target.value)} /></label>
            <div className="site-content-full"><MediaPicker label="Ảnh nội dung" value={editing.imageUrl} altText={editing.altText} caption={editing.imageCaption} onSelect={(asset) => setEditing((current) => ({ ...current, imageUrl: asset.url, altText: asset.altText || current.altText, imageCaption: asset.caption || current.imageCaption }))} onClear={() => setEditing((current) => ({ ...current, imageUrl: "", altText: "", imageCaption: "" }))} /></div>
            <label>Alt text ảnh<input value={editing.altText} onChange={(event) => setField("altText", event.target.value)} /></label>
            <label>Caption ảnh<input value={editing.imageCaption} onChange={(event) => setField("imageCaption", event.target.value)} /></label>
            <label>Thứ tự hiển thị<input type="number" value={editing.sortOrder} onChange={(event) => setField("sortOrder", Number(event.target.value))} /></label>
          </div>

          <div className="site-content-seo">
            <div><p className="eyebrow">SEO PAGE</p><h3>Metadata và cấu trúc heading</h3><p>Thông tin SEO được lưu theo page, dùng chung cho các bản ghi của page này.</p></div>
            <div className="site-content-seo-grid">
              <label>H1 page<input value={editing.h1} onChange={(event) => setField("h1", event.target.value)} /></label>
              <label>SEO title<input value={editing.metaTitle} onChange={(event) => setField("metaTitle", event.target.value)} maxLength={60} /></label>
              <label className="site-content-full">Meta description<textarea rows={3} value={editing.metaDescription} onChange={(event) => setField("metaDescription", event.target.value)} maxLength={160} /></label>
              <label>Canonical URL<input value={editing.canonicalUrl} onChange={(event) => setField("canonicalUrl", event.target.value)} /></label>
              <div className="site-content-checks"><label><input type="checkbox" checked={editing.robotsIndex} onChange={(event) => setField("robotsIndex", event.target.checked)} /> Index</label><label><input type="checkbox" checked={editing.robotsFollow} onChange={(event) => setField("robotsFollow", event.target.checked)} /> Follow</label><label><input type="checkbox" checked={editing.isVisible} onChange={(event) => setField("isVisible", event.target.checked)} /> Hiển thị</label></div>
            </div>
          </div>

          <div className="site-content-editor-actions"><span className={notice.includes("không") || notice.includes("Không") ? "error" : "success"}>{notice}</span><button type="button" className="btn btn-primary" onClick={() => void save()} disabled={busy}>{busy ? "Đang lưu..." : "Lưu nội dung"}</button></div>
        </div>
      </div>
    </section>
  );
}
