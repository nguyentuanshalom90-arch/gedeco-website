/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { MediaPicker, type MediaSelection } from "./MediaPicker";
import { RichTextEditor } from "./ProductManager";
import { deletePost, listPosts, savePost } from "@/lib/dashboard/post-actions";
import { listCategories } from "@/lib/dashboard/category-actions";
import type { CategoryListItem } from "@/lib/dashboard/category-types";
import type {
  PostInput,
  PostListItem,
  PostStatus,
} from "@/lib/dashboard/post-types";

const EMPTY_POST: PostInput = {
  id: null,
  title: "",
  slug: "",
  shortDesc: "",
  content: "",
  coverImage: null,
  coverImageAlt: "",
  coverImageCaption: "",
  ogImage: null,
  ogImageAlt: "",
  status: "DRAFT",
  categoryName: "Tin tức",
  categoryId: null,
  tags: [],
  scheduledAt: null,
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  authorName: "GEDECO",
  robotsIndex: true,
  robotsFollow: true,
  isFeatured: false,
  translationMode: "AUTO",
  translationStatus: "PENDING",
  titleEn: "",
  slugEn: "",
  shortDescEn: "",
  contentEn: "",
  coverImageAltEn: "",
  coverImageCaptionEn: "",
  ogImageAltEn: "",
  metaTitleEn: "",
  metaDescriptionEn: "",
  canonicalUrlEn: "",
  focusKeywordEn: "",
  tagsEn: [],
};

const POST_UI_STATE_KEY = "gedeco:dashboard-posts-ui";

type PostUiState = {
  mode?: "list" | "editor";
  filter?: "ALL" | PostStatus;
  query?: string;
  post?: PostInput;
  scrollY?: number;
};

function readPostUiState(): PostUiState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POST_UI_STATE_KEY);
    return raw ? JSON.parse(raw) as PostUiState : null;
  } catch {
    return null;
  }
}

function normalizePostMedia(value: PostInput): PostInput {
  const image = value.coverImage || value.ogImage || null;
  const alt = value.coverImageAlt || value.ogImageAlt;
  return { ...value, coverImage: image, ogImage: image, coverImageAlt: alt, ogImageAlt: alt };
}

function seoAudit(post: PostInput) {
  const keyword = post.focusKeyword.trim().toLocaleLowerCase("vi");
  const title = (post.metaTitle || post.title).trim();
  const description = (post.metaDescription || post.shortDesc).trim();
  const text =
    `${post.title} ${post.slug} ${description} ${post.content}`.toLocaleLowerCase(
      "vi",
    );
  const checks = [
    {
      ok: title.length >= 45 && title.length <= 65,
      label: "Tiêu đề SEO dài 45–65 ký tự",
    },
    {
      ok: description.length >= 120 && description.length <= 160,
      label: "Mô tả SEO dài 120–160 ký tự",
    },
    {
      ok:
        Boolean(keyword) &&
        post.title.toLocaleLowerCase("vi").includes(keyword),
      label: "Từ khóa chính có trong tiêu đề",
    },
    {
      ok: Boolean(keyword) && text.includes(keyword),
      label: "Từ khóa chính xuất hiện trong nội dung",
    },
    {
      ok: post.content.trim().split(/\s+/).filter(Boolean).length >= 300,
      label: "Nội dung có ít nhất 300 từ",
    },
    { ok: Boolean(post.coverImage), label: "Có ảnh bìa đại diện" },
    { ok: Boolean(post.slug), label: "Có đường dẫn thân thiện" },
    {
      ok: Boolean(post.categoryName && post.tags.length),
      label: "Có chuyên mục và thẻ",
    },
  ];
  return {
    checks,
    score: Math.round(
      (checks.filter((item) => item.ok).length / checks.length) * 100,
    ),
    title,
    description,
  };
}

function ChipInput({
  items,
  onChange,
}: {
  items: string[];
  onChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const value = draft.trim().replace(/,$/, "");
    if (value && !items.includes(value)) onChange([...items, value]);
    setDraft("");
  };
  return (
    <div className="cms-chip-input">
      {items.map((item) => (
        <span className="chip cy" key={item}>
          {item}
          <button
            type="button"
            onClick={() => onChange(items.filter((value) => value !== item))}
            aria-label={`Xóa ${item}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="Nhập thẻ rồi nhấn Enter"
      />
    </div>
  );
}

function MarkdownEditor({ value, onChange, placeholder, mediaLabel, onError }: { value: string; onChange: (value: string) => void; placeholder: string; mediaLabel: string; onError: (message: string) => void }) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaAlt, setMediaAlt] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  function rememberSelection() {
    const area = areaRef.current;
    if (area) selectionRef.current = { start: area.selectionStart, end: area.selectionEnd };
  }
  function insert(before: string, after = before) {
    const area = areaRef.current;
    if (!area) return;
    rememberSelection();
    const start = area.selectionStart;
    const end = area.selectionEnd;
    onChange(`${value.slice(0, start)}${before}${value.slice(start, end)}${after}${value.slice(end)}`);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start + before.length, end + before.length);
    });
  }
  function insertMedia(asset: MediaSelection) {
    const area = areaRef.current;
    const alt = (mediaAlt || asset.altText || asset.name).trim().replace(/[\[\]]/g, "");
    const caption = (mediaCaption || asset.caption).trim().replace(/"/g, "'");
    if (!area || !alt) {
      onError("Ảnh trong nội dung phải có alt text mô tả.");
      return;
    }
    const start = selectionRef.current.start;
    const end = selectionRef.current.end;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const syntax = `![${alt}](${asset.url}${caption ? ` "${caption}"` : ""})`;
    const prefix = before && !before.endsWith("\n") ? "\n" : "";
    const suffix = after && !after.startsWith("\n") ? "\n" : "";
    onChange(`${before}${prefix}${syntax}${suffix}${after}`);
    setMediaOpen(false);
    setMediaAlt("");
    setMediaCaption("");
  }
  return <div className="field">
    <div className="cms-editor-toolbar">
      <button type="button" onClick={() => insert("## ", "")} title="Tiêu đề"><Icon name="type" /></button>
      <button type="button" onClick={() => insert("**")} title="In đậm"><strong>B</strong></button>
      <button type="button" onClick={() => insert("[", "](https://)")} title="Liên kết"><Icon name="link" /></button>
      <button type="button" onMouseDown={(event) => { event.preventDefault(); rememberSelection(); }} onClick={() => setMediaOpen((current) => !current)} title="Ảnh"><Icon name="image" /></button>
      <button type="button" onClick={() => insert("`", "`")} title="Mã"><Icon name="code" /></button>
      <button type="button" onClick={() => insert("> ", "")} title="Trích dẫn">❝</button>
    </div>
    {mediaOpen ? <div className="cms-inline-media-panel">
      <div className="site-content-form-grid">
        <label>Alt text ảnh<input value={mediaAlt} onChange={(event) => setMediaAlt(event.target.value)} placeholder="Mô tả nội dung ảnh" /></label>
        <label>Caption ảnh<input value={mediaCaption} onChange={(event) => setMediaCaption(event.target.value)} placeholder="Chú thích hiển thị dưới ảnh" /></label>
      </div>
      <MediaPicker label={mediaLabel} value="" altText={mediaAlt} caption={mediaCaption} onSelect={insertMedia} />
    </div> : null}
    <textarea ref={areaRef} className="input cms-content-area" value={value} onChange={(event) => { rememberSelection(); onChange(event.target.value); }} onSelect={rememberSelection} onMouseUp={rememberSelection} onKeyUp={rememberSelection} onFocus={rememberSelection} placeholder={placeholder} />
    <small className="cms-help">Hỗ trợ Markdown · {words} từ</small>
  </div>;
}

function escapeEditorHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function markdownToEditorHtml(value: string) {
  const lines = value.split(/\r?\n/);
  const blocks: string[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${escapeEditorHtml(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { flushList(); continue; }
    const image = trimmed.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+\"([^\"]*)\")?\)$/);
    if (image) { flushList(); blocks.push(`<figure><img src="${escapeEditorHtml(image[2])}" alt="${escapeEditorHtml(image[1])}" loading="lazy">${image[3] ? `<figcaption>${escapeEditorHtml(image[3])}</figcaption>` : ""}</figure>`); continue; }
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { flushList(); blocks.push(`<h${heading[1].length}>${escapeEditorHtml(heading[2])}</h${heading[1].length}>`); continue; }
    if (/^[-*]\s+/.test(trimmed)) { list.push(trimmed.replace(/^[-*]\s+/, "")); continue; }
    flushList();
    blocks.push(`<p>${escapeEditorHtml(trimmed).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>")}</p>`);
  }
  flushList();
  return blocks.join("\n");
}

function editorHtmlToMarkdown(value: string) {
  if (typeof window === "undefined") return value;
  const container = document.createElement("div");
  container.innerHTML = value;
  const blocks = Array.from(container.children).map((node) => {
    const element = node as HTMLElement;
    if (element.tagName.toLowerCase() === "figure") {
      const image = element.querySelector("img");
      if (!image) return "";
      const alt = image.getAttribute("alt") || "";
      const src = image.getAttribute("src") || "";
      const caption = element.querySelector("figcaption")?.textContent?.trim() || "";
      return `![${alt}](${src}${caption ? ` \"${caption.replace(/\"/g, "'")}\"` : ""})`;
    }
    if (element.tagName.toLowerCase() === "ul" || element.tagName.toLowerCase() === "ol") return Array.from(element.querySelectorAll(":scope > li")).map((item) => `- ${(item.textContent || "").trim()}`).join("\n");
    const tag = element.tagName.toLowerCase();
    const text = (element.innerText || element.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
    if (!text) return "";
    if (/^h[1-6]$/.test(tag)) return `${"#".repeat(Number(tag.slice(1)))} ${text}`;
    return text;
  }).filter(Boolean);
  if (blocks.length) return blocks.join("\n\n");
  return (container.innerText || container.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}

function PostRichTextEditor({ value, onChange, label, placeholder, mediaLabel, onSave }: { value: string; onChange: (value: string) => void; label: string; placeholder: string; mediaLabel?: string; onSave?: () => void }) {
  const [html, setHtml] = useState(() => markdownToEditorHtml(value));
  const lastValue = useRef(value);
  useEffect(() => {
    if (value !== lastValue.current && editorHtmlToMarkdown(html) !== value) setHtml(markdownToEditorHtml(value));
    lastValue.current = value;
  }, [value, html]);
  useEffect(() => {
    const markdown = editorHtmlToMarkdown(html);
    if (markdown !== value) {
      lastValue.current = markdown;
      onChange(markdown);
    }
  }, [html, onChange, value]);
  return <RichTextEditor label={label} value={html} onChange={(nextHtml) => { setHtml(nextHtml); const markdown = editorHtmlToMarkdown(nextHtml); lastValue.current = markdown; onChange(markdown); }} placeholder={placeholder} mediaLabel={mediaLabel} onSave={onSave} />;
}

export function PostComposer() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [post, setPost] = useState<PostInput>(EMPTY_POST);
  const postRef = useRef<PostInput>(EMPTY_POST);
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [filter, setFilter] = useState<"ALL" | PostStatus>("ALL");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const seo = useMemo(() => seoAudit(post), [post]);
  useEffect(() => { postRef.current = post; }, [post]);

  useEffect(() => {
    const savedUi = readPostUiState();
    if (savedUi?.mode === "editor" && savedUi.post) setPost(normalizePostMedia({ ...EMPTY_POST, ...savedUi.post }));
    if (savedUi?.mode === "editor" || savedUi?.mode === "list") setMode(savedUi.mode);
    if (savedUi?.filter === "ALL" || savedUi?.filter === "DRAFT" || savedUi?.filter === "SCHEDULED" || savedUi?.filter === "PUBLISHED") setFilter(savedUi.filter);
    if (typeof savedUi?.query === "string") setQuery(savedUi.query);
    setHydrated(true);
    if (typeof savedUi?.scrollY === "number") {
      const scrollY = savedUi.scrollY;
      window.requestAnimationFrame(() => window.scrollTo(0, scrollY));
    }
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(POST_UI_STATE_KEY, JSON.stringify({ mode, filter, query, post, scrollY: window.scrollY }));
    } catch {
      // Draft persistence is best effort and must never block editing.
    }
  }, [hydrated, mode, filter, query, post]);
  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) => {
    const next = { ...postRef.current, [key]: value } as PostInput;
    postRef.current = next;
    setPost(next);
    setMessage("");
    setError("");
  };
  const setEnglish = <K extends keyof PostInput>(key: K, value: PostInput[K]) => {
    const next = { ...postRef.current, [key]: value, translationMode: "MANUAL" as const } as PostInput;
    postRef.current = next;
    setPost(next);
    setMessage("");
    setError("");
  };
  const refresh = async () => {
    setLoading(true);
    try {
      const [postItems, categoryItems] = await Promise.all([
        listPosts(),
        listCategories(),
      ]);
      setPosts(postItems);
      setCategories(categoryItems);
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "editor") {
        setMode("editor");
        const draftId = params.get("draft");
        const savedPost = draftId ? postItems.find((item) => item.id === draftId) : null;
        if (savedPost) setPost(normalizePostMedia(savedPost));
      }
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không tải được bài viết.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);

  function edit(item?: PostListItem) {
    setPost(
      item
        ? normalizePostMedia({ ...item })
        : {
            ...EMPTY_POST,
            tags: [],
            categoryId: categories[0]?.id ?? null,
            categoryName: categories[0]?.name ?? "Tin tức",
          },
    );
    setMode("editor");
    const params = new URLSearchParams(window.location.search);
    params.set("mode", "editor");
    params.set("draft", item?.id || "new");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    setMessage("");
    setError("");
  }
  function closeEditor() {
    setMode("list");
    const params = new URLSearchParams(window.location.search);
    params.delete("mode");
    params.delete("draft");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    void refresh();
  }
  async function persist(mode: "all" | "vietnamese" | "english" = "vietnamese") {
    setSaving(true);
    setError("");
    try {
      const payload = mode === "english" ? { ...postRef.current, translationMode: "MANUAL" as const } : mode === "vietnamese" ? { ...postRef.current, translationMode: "AUTO" as const } : postRef.current;
      const result = await savePost(payload, mode === "vietnamese" ? { preserveEnglish: true } : undefined);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const savedPost = {
        ...postRef.current,
        ...result.post,
        content: postRef.current.content,
        contentEn: postRef.current.contentEn,
      };
      postRef.current = savedPost;
      setPost(() => ({
        ...savedPost,
      }));
      setPosts((current) => [
        result.post,
        ...current.filter((item) => item.id !== result.post.id),
      ]);
      setMessage(mode === "vietnamese" ? "Đã lưu bài viết tiếng Việt; bản English hiện tại được giữ nguyên." : mode === "english" ? "Đã lưu bài viết English." : "Đã lưu toàn bộ thay đổi bài viết Việt và English.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Lưu bài viết thất bại.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function restoreAutomaticEnglish() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await savePost({ ...postRef.current, translationMode: "AUTO" });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const restoredPost = { ...postRef.current, ...result.post };
      postRef.current = restoredPost;
      setPost(restoredPost);
      setPosts((current) => [result.post, ...current.filter((item) => item.id !== result.post.id)]);
      setMessage("Đã khôi phục bản dịch English tự động.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể khôi phục bản dịch tự động.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(item: PostListItem) {
    if (saving || deleting) return;
    if (!window.confirm(`Xóa bài viết “${item.title}”?`)) return;
    setDeleting(item.id);
    setError("");
    try {
      const result = await deletePost(item.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPosts((current) =>
        current.filter((postItem) => postItem.id !== item.id),
      );
      setMessage("Đã xóa bài viết.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không thể xóa bài viết.",
      );
    } finally {
      setDeleting(null);
    }
  }

  const visible = posts.filter(
    (item) =>
      (filter === "ALL" || item.status === filter) &&
      `${item.title} ${item.slug} ${item.categoryName}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const labels: Record<PostStatus, string> = {
    DRAFT: "Bản nháp",
    SCHEDULED: "Đã lên lịch",
    PUBLISHED: "Đã xuất bản",
  };

  if (mode === "list")
    return (
      <section className="cms-posts product-manager">
        <div className="dashboard-view-head cms-title-row">
          <div>
            <p className="eyebrow">QUẢN TRỊ NỘI DUNG</p>
            <h1 className="disp">Bài viết</h1>
            <p>
              Quản lý nội dung, lịch xuất bản và chất lượng SEO tại một nơi.
            </p>
          </div>
        </div>
        {(message || error) && (
          <div className={`cms-notice ${error ? "error" : "success"}`}>
            {error || message}
          </div>
        )}
        <section className="panel cms-list-panel product-list-panel">
          <div className="product-list-head"><div className="product-list-tools">
            <div className="cms-search">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tiêu đề hoặc đường dẫn bài viết"
              />
            </div>
            <select aria-label="Trạng thái bài viết" className="product-status-filter" value={filter} onChange={(event) => setFilter(event.target.value as "ALL" | PostStatus)}>
              <option value="ALL">Mọi trạng thái</option><option value="PUBLISHED">Đã xuất bản</option><option value="DRAFT">Bản nháp</option><option value="SCHEDULED">Đã lên lịch</option>
            </select>
            <button type="button" className="btn btn-add-data" onClick={() => edit()}><Icon name="plus" size={15} />Viết bài mới</button>
          </div></div>
          <div className="product-bulk-bar"><span>{loading ? "Đang tải bài viết…" : `${visible.length} bài viết`}</span></div>
          {loading ? (
            <p className="cms-empty">Đang tải bài viết…</p>
          ) : visible.length ? (
            <div className="cms-post-list">
              {visible.map((item) => (
                <article key={item.id} className="product-row post-product-row">
                  <div className="product-row-thumb">{item.coverImage ? <img src={item.coverImage} alt="" /> : <Icon name="feather" size={18} />}</div>
                  <div className="product-row-info"><strong>{item.title}</strong><span>{labels[item.status]} · /{item.slug} · {item.categoryName}</span></div>
                  <div className="product-row-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => edit(item)} disabled={Boolean(saving || deleting)} aria-label={`Sửa ${item.title}`} title="Sửa bài viết"><Icon name="pencil" size={15} /></button>
                    {item.status === "PUBLISHED" ? <a className="btn btn-ghost" href={`/tin-tuc/${item.slug}`} target="_blank" rel="noreferrer" aria-label={`Xem ${item.title}`} title="Xem bài viết"><Icon name="external" size={15} /></a> : null}
                    <button type="button" className="btn btn-ghost cms-danger" onClick={() => void remove(item)} disabled={Boolean(saving || deleting)} aria-label={`Xóa ${item.title}`} title={deleting === item.id ? "Đang xóa…" : "Xóa bài viết"}><Icon name="trash" size={15} /></button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="cms-empty">Chưa có bài viết phù hợp.</p>
          )}
        </section>
      </section>
    );

  const wordCount = post.content.trim()
    ? post.content.trim().split(/\s+/).length
    : 0;
  return (
    <section className="cms-posts product-manager">
      <div className="product-workspace has-editor">
        <section className="panel cms-list-panel product-list-panel">
          <div className="product-list-head">
            <div className="product-list-tools">
              <div className="cms-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tiêu đề hoặc đường dẫn bài viết" /></div>
              <select aria-label="Trạng thái bài viết" className="product-status-filter" value={filter} onChange={(event) => setFilter(event.target.value as "ALL" | PostStatus)}>
                <option value="ALL">Mọi trạng thái</option><option value="PUBLISHED">Đã xuất bản</option><option value="DRAFT">Bản nháp</option><option value="SCHEDULED">Đã lên lịch</option>
              </select>
              <button type="button" className="btn btn-add-data" onClick={() => edit()}><Icon name="plus" size={15} />Viết bài mới</button>
            </div>
          </div>
          <div className="product-bulk-bar"><span>{loading ? "Đang tải bài viết…" : `${visible.length} bài viết`}</span></div>
        </section>
        <section className="cms-post-editor product-manager product-editor">
      <div className="cms-section-head product-editor-sticky-head">
        <div>
          <p className="eyebrow">{post.id ? "CHỈNH SỬA" : "TẠO MỚI"}</p>
          <h2>{post.title || "Bài viết mới"}</h2>
        </div>
        <div className="product-editor-head-actions">
                    {post.status === "PUBLISHED" && post.slug ? <a className="btn btn-ghost" href={`/tin-tuc/${post.slug}`} target="_blank" rel="noreferrer"><Icon name="external" size={15} />Xem</a> : <button className="btn btn-ghost" type="button" disabled title="Lưu bài viết trước khi xem live"><Icon name="external" size={15} />Xem</button>}<button className="btn btn-primary product-editor-head-save" type="button" disabled={saving} onClick={() => void persist("all")} title="Lưu toàn bộ thay đổi tiếng Việt và English">{saving ? "Đang lưu…" : "Lưu"}</button>
          <button className="btn btn-ghost product-editor-close-button" type="button" aria-label="Đóng" title="Đóng" onClick={closeEditor}><Icon name="close" size={17} /></button>
        </div>
      </div>
      {(message || error) && (
        <div className={`cms-notice ${error ? "error" : "success"}`}>
          {error || message}
        </div>
      )}
      <div className="cms-editor-grid product-editor-columns">
        <main className="cms-editor-main product-editor-primary">
          <section className="panel cms-card site-content-form-grid">
            <div className="site-content-full product-title-settings">
              <RichTextEditor
                label="Tiêu đề bài viết"
                compact
                value={markdownToEditorHtml(post.title)}
                onChange={(value) => set("title", editorHtmlToMarkdown(value).replace(/\s+/g, " ").trim())}
                placeholder="Nhập tiêu đề rõ ràng, thu hút…"
                onSave={() => void persist("all")}
              />
            </div>
            <label className="field">
              <span>Đường dẫn</span>
              <input
                className="input"
                value={post.slug}
                onChange={(event) => set("slug", event.target.value)}
                placeholder="tự tạo từ tiêu đề"
              />
            </label>
            <label className="field">
              <span>Chuyên mục</span>
              <select
                className="input"
                value={post.categoryId ?? ""}
                onChange={(event) => {
                  const selected = categories.find(
                    (item) => item.id === event.target.value,
                  );
                  setPost((current) => ({
                    ...current,
                    categoryId: selected?.id ?? null,
                    categoryName: selected?.name ?? "Tin tức",
                  }));
                }}
              >
                <option value="">Tin tức chung</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="site-content-full post-short-excerpt">
              <PostRichTextEditor label="Mô tả ngắn" value={post.shortDesc} onChange={(value) => set("shortDesc", value.slice(0, 160))} placeholder="Tóm tắt nội dung bài viết…" onSave={() => void persist("all")} />
            </div>
            <div className="site-content-full">
              <PostRichTextEditor label="Nội dung chi tiết" value={post.content} onChange={(value) => set("content", value)} placeholder="Soạn nội dung bài viết…" mediaLabel="Ảnh trong nội dung bài viết" onSave={() => void persist("all")} />
            </div>
          </section>
          <section className="panel cms-card">
            <div className="cms-section-head">
              <div>
                <p className="eyebrow">TỐI ƯU TÌM KIẾM</p>
                <h2>SEO bài viết</h2>
              </div>
              <strong
                className={`cms-seo-score ${seo.score >= 80 ? "good" : seo.score >= 50 ? "medium" : "low"}`}
              >
                {seo.score}/100
              </strong>
            </div>
            <div className="cms-seo-grid">
              <label className="field">
                <span>Từ khóa chính</span>
                <input
                  className="input"
                  value={post.focusKeyword}
                  onChange={(event) => set("focusKeyword", event.target.value)}
                  placeholder="VD: logistics quốc tế"
                />
              </label>
              <label className="field">
                <span>
                  Tiêu đề SEO <small>{post.metaTitle.length}/65</small>
                </span>
                <input
                  className="input"
                  maxLength={65}
                  value={post.metaTitle}
                  onChange={(event) => set("metaTitle", event.target.value)}
                  placeholder={post.title || "Tiêu đề hiển thị trên Google"}
                />
              </label>
              <label className="field cms-span-2">
                <span>
                  Mô tả SEO <small>{post.metaDescription.length}/160</small>
                </span>
                <textarea
                  className="input"
                  maxLength={160}
                  value={post.metaDescription}
                  onChange={(event) =>
                    set("metaDescription", event.target.value)
                  }
                  placeholder={
                    post.shortDesc || "Mô tả hiển thị trên kết quả tìm kiếm"
                  }
                />
              </label>
              <label className="field cms-span-2">
                <span>URL chính tắc (canonical)</span>
                <input
                  className="input"
                  type="url"
                  value={post.canonicalUrl}
                  onChange={(event) => set("canonicalUrl", event.target.value)}
                  placeholder="https://gedeco.vn/tin-tuc/..."
                />
              </label>
            </div>
            <div className="cms-google-preview">
              <small>
                gedeco.vn › tin-tuc › {post.slug || "duong-dan-bai-viet"}
              </small>
              <strong>{seo.title || "Tiêu đề bài viết trên Google"}</strong>
              <p>
                {seo.description ||
                  "Mô tả SEO sẽ xuất hiện tại đây để bạn kiểm tra trước khi xuất bản."}
              </p>
            </div>
            <div className="cms-seo-checks">
              {seo.checks.map((check) => (
                <span key={check.label} className={check.ok ? "ok" : "todo"}>
                  <Icon name={check.ok ? "check" : "plus"} size={13} />
                  {check.label}
                </span>
              ))}
            </div>
          </section>
          <div className="product-editor-save-actions product-editor-locale-save post-locale-save-vietnamese">
            <button className="btn btn-primary" type="button" disabled={saving} onClick={() => void persist("vietnamese")}>
              <Icon name="check" size={16} /> {saving ? "Đang lưu…" : "Lưu bài viết tiếng Việt"}
            </button>
          </div>
        </main>
          <section className="panel cms-card cms-english-editor">
            <div className="cms-section-head">
              <div><p className="eyebrow">NỘI DUNG SONG NGỮ</p><h2>English version</h2><p>Trạng thái hiện tại: <strong>{post.translationStatus}</strong></p></div>
              <label className="field"><span>Chế độ English</span><select className="input" value={post.translationMode} onChange={(event) => set("translationMode", event.target.value as "AUTO" | "MANUAL")}><option value="AUTO">Khôi phục bản dịch tự động</option><option value="MANUAL">Tự nhập và duyệt</option></select></label>
            </div>
            <div className="cms-english-fields">
              <div className="site-content-form-grid">
                <div className="site-content-full product-title-settings">
                  <RichTextEditor
                    label="English title"
                    compact
                    value={markdownToEditorHtml(post.titleEn)}
                    onChange={(value) => setEnglish("titleEn", editorHtmlToMarkdown(value).replace(/\s+/g, " ").trim())}
                    placeholder="Write a clear English title…"
                    onSave={() => void persist("all")}
                  />
                </div>
                <label className="field"><span>English slug</span><input className="input" value={post.slugEn} onChange={(event) => setEnglish("slugEn", event.target.value)} placeholder="generated-from-title" /></label>
                <label className="field"><span>English category</span><input className="input" value={categories.find((item) => item.id === post.categoryId)?.nameEn || "News"} readOnly /></label>
                <div className="site-content-full post-short-excerpt"><PostRichTextEditor label="English excerpt" value={post.shortDescEn} onChange={(value) => setEnglish("shortDescEn", value.slice(0, 160))} placeholder="Write a short English article description…" onSave={() => void persist("all")} /></div>
                <div className="site-content-full"><PostRichTextEditor label="English content" value={post.contentEn} onChange={(value) => setEnglish("contentEn", value)} placeholder="Write English article content…" mediaLabel="English article image" onSave={() => void persist("all")} /></div>
              </div>
              <div className="cms-seo-grid">
                <label className="field"><span>English tags</span><ChipInput items={post.tagsEn} onChange={(value) => setEnglish("tagsEn", value)} /></label>
                <label className="field"><span>English focus keyword</span><input className="input" value={post.focusKeywordEn} onChange={(event) => setEnglish("focusKeywordEn", event.target.value)} /></label>
                <label className="field"><span>Open Graph image alt (EN)</span><input className="input" value={post.ogImageAltEn} onChange={(event) => setEnglish("ogImageAltEn", event.target.value)} /></label>
                <div className="site-content-seo site-content-full">
                  <div><p className="eyebrow">ENGLISH SEO</p><h3>Metadata and indexing</h3></div>
                  <div className="site-content-seo-grid">
                    <label>SEO title <small>{post.metaTitleEn.length}/65</small><input maxLength={65} value={post.metaTitleEn} onChange={(event) => setEnglish("metaTitleEn", event.target.value)} /><small className="product-field-help">Defaults to the English article title; admin can customize.</small></label>
                    <label className="site-content-full">Meta description <small>{post.metaDescriptionEn.length}/160</small><textarea rows={3} maxLength={160} value={post.metaDescriptionEn} onChange={(event) => setEnglish("metaDescriptionEn", event.target.value)} /><small className="product-field-help">Defaults to the English excerpt; admin can customize.</small></label>
                    <label>Canonical URL<input value={post.canonicalUrlEn} onChange={(event) => setEnglish("canonicalUrlEn", event.target.value)} placeholder="/en/news/article-slug" /><small className="product-field-help">Generated from the English article slug; admin can customize.</small></label>
                    <div className="site-content-checks"><label><input type="checkbox" checked={post.robotsIndex} onChange={(event) => setEnglish("robotsIndex", event.target.checked)} /> Index</label><label><input type="checkbox" checked={post.robotsFollow} onChange={(event) => setEnglish("robotsFollow", event.target.checked)} /> Follow</label></div>
                  </div>
                </div>
              </div>
              <aside className="post-locale-media-card">
                <div className="product-editor-media-head"><strong>Ảnh bìa English</strong><span>Ảnh dùng cho bản English, alt và caption chỉnh sửa độc lập.</span></div>
                <div className="product-editor-media-main"><MediaPicker
                  value={post.coverImage || ""}
                  altText={post.coverImageAltEn}
                  caption={post.coverImageCaptionEn}
                  onSelect={(asset) => {
                    const current = postRef.current;
                    const next = {
                      ...current,
                      ...(current.coverImage ? {} : { coverImage: asset.url, ogImage: asset.url }),
                      coverImageAltEn: asset.altText || current.coverImageAltEn || current.titleEn,
                      coverImageCaptionEn: asset.caption || current.coverImageCaptionEn,
                    };
                    postRef.current = next;
                    setPost(next);
                  }}
                  label="Ảnh bìa English"
                /></div>
                <div className="product-editor-media-fields"><label>Cover image alt (EN)<input value={post.coverImageAltEn} onChange={(event) => setEnglish("coverImageAltEn", event.target.value)} /></label><label>Cover image caption (EN)<textarea rows={2} value={post.coverImageCaptionEn} onChange={(event) => setEnglish("coverImageCaptionEn", event.target.value)} /></label></div>
              </aside>
              <p className="cms-help">English được hiển thị và chỉnh sửa đầy đủ như module Sản phẩm. Chọn “Khôi phục bản dịch tự động” để tái sinh bản dịch English từ tiếng Việt.</p>
            </div>
          </section>
        <aside className="cms-editor-aside product-editor-media">
          <section className="panel cms-card">
            <h3>Xuất bản</h3>
            <label className="field">
              <span>Trạng thái</span>
              <select
                className="input"
                value={post.status}
                onChange={(event) =>
                  set("status", event.target.value as PostStatus)
                }
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="SCHEDULED">Lên lịch</option>
                <option value="PUBLISHED">Xuất bản ngay</option>
              </select>
            </label>
            {post.status === "SCHEDULED" && (
              <label className="field">
                <span>Thời gian đăng</span>
                <input
                  className="input"
                  type="datetime-local"
                  value={post.scheduledAt ?? ""}
                  onChange={(event) =>
                    set("scheduledAt", event.target.value || null)
                  }
                />
              </label>
            )}
            <label className="field">
              <span>Tác giả</span>
              <input
                className="input"
                value={post.authorName}
                onChange={(event) => set("authorName", event.target.value)}
              />
            </label>
            <div className="field">
              <span>Thẻ bài viết</span>
              <ChipInput
                items={post.tags}
                onChange={(value) => set("tags", value)}
              />
            </div>
            <label className="cms-check">
              <input
                type="checkbox"
                checked={post.isFeatured}
                onChange={(event) => set("isFeatured", event.target.checked)}
              />
              Bài viết nổi bật
            </label>
            <label className="cms-check">
              <input
                type="checkbox"
                checked={post.robotsIndex}
                onChange={(event) => set("robotsIndex", event.target.checked)}
              />
              Cho phép lập chỉ mục
            </label>
            <label className="cms-check">
              <input
                type="checkbox"
                checked={post.robotsFollow}
                onChange={(event) => set("robotsFollow", event.target.checked)}
              />
              Cho phép theo liên kết
            </label>
          </section>
          <section className="panel cms-card">
            <div className="product-editor-media-head"><strong>Ảnh bìa</strong><span>Ảnh đại diện cho bài viết</span></div>
            <div className="product-editor-media-main"><MediaPicker
                value={post.coverImage || ""}
                altText={post.coverImageAlt}
                caption={post.coverImageCaption}
                onClear={() => { const next = { ...postRef.current, coverImage: null, ogImage: null, coverImageAlt: "", ogImageAlt: "", coverImageCaption: "" }; postRef.current = next; setPost(next); }}
                onSelect={(asset) => { const current = postRef.current; const next = { ...current, coverImage: asset.url, ogImage: asset.url, coverImageAlt: asset.altText || current.coverImageAlt || current.title, ogImageAlt: asset.altText || current.ogImageAlt || current.title, coverImageCaption: asset.caption || current.coverImageCaption }; postRef.current = next; setPost(next); }}
                label="Ảnh bìa"
              /></div>
            <div className="product-editor-media-fields"><label>Alt ảnh bìa<input value={post.coverImageAlt} onChange={(event) => set("coverImageAlt", event.target.value)} placeholder="Mô tả ngắn, đúng nội dung ảnh" /></label><label>Chú thích ảnh<textarea rows={2} value={post.coverImageCaption} onChange={(event) => set("coverImageCaption", event.target.value)} /></label></div>
            <small className="cms-help">Khuyến nghị 1200 × 630 px.</small>
          </section>
        </aside>
      </div>
      <div className="product-editor-save-actions product-editor-locale-save post-locale-save-english">
        <button className="btn btn-primary" type="button" disabled={saving} onClick={() => void persist("english")}>
          <Icon name="check" size={16} /> {saving ? "Đang lưu…" : "Lưu bài viết English"}
        </button>
        <button className="btn btn-ghost" type="button" disabled={saving} onClick={() => void restoreAutomaticEnglish()}>
          Khôi phục bản dịch tự động
        </button>
      </div>
        </section>
      </div>
    </section>
  );
}
