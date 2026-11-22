/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { MediaPicker, type MediaSelection } from "./MediaPicker";
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
  focusKeywordEn: "",
  tagsEn: [],
};

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

export function PostComposer() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [post, setPost] = useState<PostInput>(EMPTY_POST);
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [filter, setFilter] = useState<"ALL" | PostStatus>("ALL");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const seo = useMemo(() => seoAudit(post), [post]);
  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) => {
    setPost((current) => ({ ...current, [key]: value }));
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
        ? { ...item }
        : {
            ...EMPTY_POST,
            tags: [],
            categoryId: categories[0]?.id ?? null,
            categoryName: categories[0]?.name ?? "Tin tức",
          },
    );
    setMode("editor");
    setMessage("");
    setError("");
  }
  async function persist() {
    setSaving(true);
    setError("");
    try {
      const result = await savePost(post);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPost(result.post);
      setPosts((current) => [
        result.post,
        ...current.filter((item) => item.id !== result.post.id),
      ]);
      setMessage(`Đã lưu bài viết · English: ${result.translation.status === "TRANSLATED" ? "đã sẵn sàng" : result.translation.status === "FAILED" ? "dịch lỗi — chưa công khai" : "cần rà soát"}.`);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Lưu bài viết thất bại.",
      );
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
      <section className="cms-posts">
        <div className="dashboard-view-head cms-title-row">
          <div>
            <p className="eyebrow">QUẢN TRỊ NỘI DUNG</p>
            <h1 className="disp">Bài viết</h1>
            <p>
              Quản lý nội dung, lịch xuất bản và chất lượng SEO tại một nơi.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => edit()}
          >
            <Icon name="plus" size={16} />
            Viết bài mới
          </button>
        </div>
        {(message || error) && (
          <div className={`cms-notice ${error ? "error" : "success"}`}>
            {error || message}
          </div>
        )}
        <section className="panel cms-list-panel">
          <div className="cms-list-tools">
            <div className="cms-search">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tiêu đề, đường dẫn hoặc chuyên mục"
              />
            </div>
            <div className="seg">
              {(["ALL", "PUBLISHED", "DRAFT", "SCHEDULED"] as const).map(
                (value) => (
                  <button
                    type="button"
                    key={value}
                    className={filter === value ? "on" : ""}
                    onClick={() => setFilter(value)}
                  >
                    {value === "ALL" ? "Tất cả" : labels[value]}
                  </button>
                ),
              )}
            </div>
          </div>
          {loading ? (
            <p className="cms-empty">Đang tải bài viết…</p>
          ) : visible.length ? (
            <div className="cms-post-list">
              {visible.map((item) => (
                <article key={item.id} className="cms-post-row">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt="" />
                  ) : (
                    <div className="cms-post-placeholder">
                      <Icon name="feather" size={22} />
                    </div>
                  )}
                  <div>
                    <span className={`cms-status ${item.status.toLowerCase()}`}>
                      {labels[item.status]}
                    </span>
                    <strong>{item.title}</strong>
                    <small>
                      /{item.slug} · {item.categoryName} · cập nhật{" "}
                      {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                    </small>
                  </div>
                  <div className="cms-row-actions">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => edit(item)}
                      disabled={Boolean(saving || deleting)}
                    >
                      <Icon name="pencil" size={15} />
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn cms-danger"
                      onClick={() => void remove(item)}
                      disabled={Boolean(saving || deleting)}
                    >
                      <Icon name="trash" size={15} />
                      {deleting === item.id ? "Đang xóa…" : "Xóa"}
                    </button>
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
    <section className="cms-post-editor">
      <div className="dashboard-view-head cms-title-row">
        <div>
          <button
            type="button"
            className="cms-back"
            onClick={() => {
              setMode("list");
              void refresh();
            }}
          >
            ← Danh sách bài viết
          </button>
          <h1 className="disp">
            {post.id ? "Chỉnh sửa bài viết" : "Viết bài mới"}
          </h1>
          <p>
            {wordCount} từ · SEO {seo.score}/100
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void persist()}
          disabled={saving}
        >
          <Icon name="check" size={16} />
          {saving ? "Đang lưu…" : "Lưu bài viết"}
        </button>
      </div>
      {(message || error) && (
        <div className={`cms-notice ${error ? "error" : "success"}`}>
          {error || message}
        </div>
      )}
      <div className="cms-editor-grid">
        <main className="cms-editor-main">
          <section className="panel cms-card">
            <label className="field">
              <span>Tiêu đề bài viết</span>
              <input
                className="input cms-title-input"
                value={post.title}
                onChange={(event) => set("title", event.target.value)}
                placeholder="Nhập tiêu đề rõ ràng, thu hút…"
              />
            </label>
            <label className="field">
              <span>
                Mô tả ngắn <small>{post.shortDesc.length}/160</small>
              </span>
              <textarea
                className="input"
                maxLength={160}
                value={post.shortDesc}
                onChange={(event) => set("shortDesc", event.target.value)}
                placeholder="Tóm tắt nội dung bài viết…"
              />
            </label>
            <div><span>Nội dung chi tiết</span><MarkdownEditor value={post.content} onChange={(value) => set("content", value)} placeholder="Soạn nội dung bằng Markdown…" mediaLabel="Ảnh trong nội dung" onError={setError} /></div>
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
          <section className="panel cms-card cms-english-editor">
            <div className="cms-section-head">
              <div><p className="eyebrow">NỘI DUNG SONG NGỮ</p><h2>English version</h2><p>Trạng thái hiện tại: <strong>{post.translationStatus}</strong></p></div>
              <label className="field"><span>Chế độ English</span><select className="input" value={post.translationMode} onChange={(event) => set("translationMode", event.target.value as "AUTO" | "MANUAL")}><option value="AUTO">Dịch tự động</option><option value="MANUAL">Tự nhập và duyệt</option></select></label>
            </div>
            {post.translationMode === "AUTO" ? <p className="cms-help">Hệ thống sẽ dịch sau khi lưu. Nếu dịch lỗi, URL English sẽ không được công khai; chọn “Tự nhập và duyệt” để biên tập thủ công.</p> : <div className="cms-english-fields">
              <div className="cms-seo-grid">
                <label className="field"><span>English title</span><input className="input" value={post.titleEn} onChange={(event) => set("titleEn", event.target.value)} /></label>
                <label className="field"><span>English slug</span><input className="input" value={post.slugEn} onChange={(event) => set("slugEn", event.target.value)} placeholder="generated-from-title" /></label>
                <label className="field cms-span-2"><span>English excerpt <small>{post.shortDescEn.length}/160</small></span><textarea className="input" maxLength={160} value={post.shortDescEn} onChange={(event) => set("shortDescEn", event.target.value)} /></label>
              </div>
              <div><span>English content</span><MarkdownEditor value={post.contentEn} onChange={(value) => set("contentEn", value)} placeholder="Write English content in Markdown…" mediaLabel="English content image" onError={setError} /></div>
              <div className="cms-seo-grid">
                <label className="field"><span>English tags</span><ChipInput items={post.tagsEn} onChange={(value) => set("tagsEn", value)} /></label>
                <label className="field"><span>English focus keyword</span><input className="input" value={post.focusKeywordEn} onChange={(event) => set("focusKeywordEn", event.target.value)} /></label>
                <label className="field"><span>Cover image alt (EN)</span><input className="input" value={post.coverImageAltEn} onChange={(event) => set("coverImageAltEn", event.target.value)} /></label>
                <label className="field"><span>Cover image caption (EN)</span><input className="input" value={post.coverImageCaptionEn} onChange={(event) => set("coverImageCaptionEn", event.target.value)} /></label>
                <label className="field"><span>Open Graph image alt (EN)</span><input className="input" value={post.ogImageAltEn} onChange={(event) => set("ogImageAltEn", event.target.value)} /></label>
                <label className="field"><span>English SEO title <small>{post.metaTitleEn.length}/65</small></span><input className="input" maxLength={65} value={post.metaTitleEn} onChange={(event) => set("metaTitleEn", event.target.value)} /></label>
                <label className="field cms-span-2"><span>English meta description <small>{post.metaDescriptionEn.length}/160</small></span><textarea className="input" maxLength={160} value={post.metaDescriptionEn} onChange={(event) => set("metaDescriptionEn", event.target.value)} /></label>
              </div>
            </div>}
          </section>
        </main>
        <aside className="cms-editor-aside">
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
            <label className="field">
              <span>Tác giả</span>
              <input
                className="input"
                value={post.authorName}
                onChange={(event) => set("authorName", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Đường dẫn</span>
              <input
                className="input"
                value={post.slug}
                onChange={(event) => set("slug", event.target.value)}
                placeholder="tự tạo từ tiêu đề"
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
            <h3>Ảnh bìa</h3>
            <MediaPicker
              value={post.coverImage || ""}
              altText={post.coverImageAlt}
              caption={post.coverImageCaption}
              onClear={() => setPost((current) => ({ ...current, coverImage: null, coverImageAlt: "", coverImageCaption: "" }))}
              onSelect={(asset) => setPost((current) => ({ ...current, coverImage: asset.url, coverImageAlt: asset.altText || current.coverImageAlt || current.title, coverImageCaption: asset.caption || current.coverImageCaption }))}
              label="Ảnh bìa"
            />
            <label>Alt ảnh bìa<input value={post.coverImageAlt} onChange={(event) => set("coverImageAlt", event.target.value)} placeholder="Mô tả ngắn, đúng nội dung ảnh" /></label>
            <label>Chú thích ảnh<textarea rows={2} value={post.coverImageCaption} onChange={(event) => set("coverImageCaption", event.target.value)} /></label>
            <small className="cms-help">Khuyến nghị 1200 × 630 px.</small>
          </section>
          <section className="panel cms-card">
            <h3>Ảnh chia sẻ mạng xã hội</h3>
            <MediaPicker
              value={post.ogImage || ""}
              altText={post.ogImageAlt}
              onClear={() => setPost((current) => ({ ...current, ogImage: null, ogImageAlt: "" }))}
              onSelect={(asset) => setPost((current) => ({ ...current, ogImage: asset.url, ogImageAlt: asset.altText || current.ogImageAlt || current.title }))}
              label="Ảnh mạng xã hội"
            />
            <label>Alt ảnh chia sẻ<input value={post.ogImageAlt} onChange={(event) => set("ogImageAlt", event.target.value)} /></label>
            <small className="cms-help">Nếu để trống sẽ dùng ảnh bìa.</small>
          </section>
        </aside>
      </div>
    </section>
  );
}
