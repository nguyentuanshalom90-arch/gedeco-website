/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import { deletePost, listPosts, savePost } from "@/lib/dashboard/post-actions";
import { listCategories } from "@/lib/dashboard/category-actions";
import type { CategoryListItem } from "@/lib/dashboard/category-types";
import type {
  MediaAssetItem,
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
  ogImage: null,
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
};

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/media", { method: "POST", body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Tải ảnh thất bại.");
  return payload.url;
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

function ImagePicker({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAssetItem[]>([]);
  async function library() {
    setOpen(true);
    setBusy(true);
    try {
      const response = await fetch("/api/media");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setAssets(payload.assets || []);
    } finally {
      setBusy(false);
    }
  }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file));
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }
  return (
    <div className="cms-image-picker">
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={upload}
      />
      {value ? (
        <div className="cms-image-preview">
          <img src={value} alt={label} />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Xóa ${label}`}
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      ) : (
        <div className="cms-image-actions">
          <button type="button" className="drop" onClick={() => void library()}>
            <Icon name="image" size={22} />
            <strong>Chọn từ thư viện</strong>
          </button>
          <button
            type="button"
            className="drop"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <Icon name="upload" size={22} />
            <strong>{busy ? "Đang tải…" : "Tải ảnh lên"}</strong>
          </button>
        </div>
      )}
      {open && (
        <div className="post-media-library">
          <div className="post-media-library-head">
            <strong>Thư viện ảnh</strong>
            <button
              type="button"
              className="btn"
              onClick={() => setOpen(false)}
            >
              Đóng
            </button>
          </div>
          {busy ? (
            <p>Đang tải ảnh…</p>
          ) : assets.length ? (
            <div className="post-media-grid">
              {assets.map((asset) => (
                <button
                  type="button"
                  key={asset.id}
                  onClick={() => {
                    onChange(asset.url);
                    setOpen(false);
                  }}
                >
                  <img src={asset.url} alt={asset.name} />
                  <span>{asset.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p>Chưa có ảnh trong thư viện.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function PostComposer() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [post, setPost] = useState<PostInput>(EMPTY_POST);
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [filter, setFilter] = useState<"ALL" | PostStatus>("ALL");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);
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
  function insert(before: string, after = before) {
    const area = contentRef.current;
    if (!area) return;
    const start = area.selectionStart,
      end = area.selectionEnd;
    const selected = post.content.slice(start, end);
    set(
      "content",
      `${post.content.slice(0, start)}${before}${selected}${after}${post.content.slice(end)}`,
    );
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start + before.length, end + before.length);
    });
  }
  async function persist() {
    setSaving(true);
    setError("");
    try {
      const result = await savePost(post);
      setPost(result.post);
      setPosts((current) => [
        result.post,
        ...current.filter((item) => item.id !== result.post.id),
      ]);
      setMessage("Đã lưu bài viết thành công.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Lưu bài viết thất bại.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function remove(item: PostListItem) {
    if (!window.confirm(`Xóa bài viết “${item.title}”?`)) return;
    try {
      await deletePost(item.id);
      setPosts((current) =>
        current.filter((postItem) => postItem.id !== item.id),
      );
      setMessage("Đã xóa bài viết.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không thể xóa bài viết.",
      );
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
                    >
                      <Icon name="pencil" size={15} />
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn cms-danger"
                      onClick={() => void remove(item)}
                    >
                      <Icon name="trash" size={15} />
                      Xóa
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
            <div className="field">
              <span>Nội dung chi tiết</span>
              <div className="cms-editor-toolbar">
                <button
                  type="button"
                  onClick={() => insert("## ", "")}
                  title="Tiêu đề"
                >
                  <Icon name="type" />
                </button>
                <button
                  type="button"
                  onClick={() => insert("**")}
                  title="In đậm"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => insert("[", "](https://)")}
                  title="Liên kết"
                >
                  <Icon name="link" />
                </button>
                <button
                  type="button"
                  onClick={() => insert("![Mô tả ảnh](/", ")")}
                  title="Ảnh"
                >
                  <Icon name="image" />
                </button>
                <button
                  type="button"
                  onClick={() => insert("`", "`")}
                  title="Mã"
                >
                  <Icon name="code" />
                </button>
                <button
                  type="button"
                  onClick={() => insert("> ", "")}
                  title="Trích dẫn"
                >
                  ❝
                </button>
              </div>
              <textarea
                ref={contentRef}
                className="input cms-content-area"
                value={post.content}
                onChange={(event) => set("content", event.target.value)}
                placeholder="Soạn nội dung bằng Markdown…"
              />
              <small className="cms-help">
                Hỗ trợ Markdown · {wordCount} từ
              </small>
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
                  maxLength={70}
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
                  maxLength={170}
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
            <ImagePicker
              value={post.coverImage}
              onChange={(value) => set("coverImage", value)}
              label="Ảnh bìa"
            />
            <small className="cms-help">Khuyến nghị 1200 × 630 px.</small>
          </section>
          <section className="panel cms-card">
            <h3>Ảnh chia sẻ mạng xã hội</h3>
            <ImagePicker
              value={post.ogImage}
              onChange={(value) => set("ogImage", value)}
              label="Ảnh mạng xã hội"
            />
            <small className="cms-help">Nếu để trống sẽ dùng ảnh bìa.</small>
          </section>
        </aside>
      </div>
    </section>
  );
}
