"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import {
  deleteCategory,
  listCategories,
  saveCategory,
} from "@/lib/dashboard/category-actions";
import type {
  CategoryInput,
  CategoryListItem,
} from "@/lib/dashboard/category-types";

const EMPTY_CATEGORY: CategoryInput = {
  id: null,
  name: "",
  slug: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  robotsIndex: true,
  robotsFollow: true,
  sortOrder: 0,
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function CategoryManager() {
  const [items, setItems] = useState<CategoryListItem[]>([]);
  const [draft, setDraft] = useState<CategoryInput>(EMPTY_CATEGORY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const editing = Boolean(draft.id);
  const visible = useMemo(
    () =>
      items.filter((item) =>
        `${item.name} ${item.slug}`
          .toLocaleLowerCase("vi")
          .includes(query.toLocaleLowerCase("vi")),
      ),
    [items, query],
  );

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listCategories());
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không tải được danh mục.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const set = <K extends keyof CategoryInput>(
    key: K,
    value: CategoryInput[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage("");
    setError("");
  };
  function edit(item?: CategoryListItem) {
    setDraft(item ? { ...item } : { ...EMPTY_CATEGORY });
    setMessage("");
    setError("");
  }
  async function persist() {
    setSaving(true);
    setError("");
    try {
      const result = await saveCategory(draft);
      setItems((current) =>
        [
          result.category,
          ...current.filter((item) => item.id !== result.category.id),
        ].sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "vi"),
        ),
      );
      setDraft(result.category);
      setMessage("Đã lưu danh mục bài viết.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không thể lưu danh mục.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function remove(item: CategoryListItem) {
    if (
      !window.confirm(`Xóa danh mục “${item.name}”? Bài viết sẽ được giữ lại.`)
    )
      return;
    try {
      await deleteCategory(item.id);
      setItems((current) => current.filter((value) => value.id !== item.id));
      if (draft.id === item.id) setDraft({ ...EMPTY_CATEGORY });
      setMessage(
        "Đã xóa danh mục. Các bài viết liên quan vẫn được giữ nguyên.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không thể xóa danh mục.",
      );
    }
  }

  return (
    <section className="cms-categories">
      <div className="dashboard-view-head cms-title-row">
        <div>
          <p className="eyebrow">QUẢN LÝ NỘI DUNG</p>
          <h1 className="disp">Danh mục bài viết</h1>
          <p>
            Tổ chức bài viết theo chủ đề và tối ưu trang danh mục cho công cụ
            tìm kiếm.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => edit()}
        >
          <Icon name="plus" size={16} />
          Thêm danh mục
        </button>
      </div>
      {(message || error) && (
        <div className={`cms-notice ${error ? "error" : "success"}`}>
          {error || message}
        </div>
      )}
      <div className="cms-category-grid">
        <section className="panel cms-list-panel">
          <div className="cms-list-tools">
            <div className="cms-search">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm danh mục theo tên hoặc đường dẫn"
              />
            </div>
          </div>
          {loading ? (
            <p className="cms-empty">Đang tải danh mục…</p>
          ) : visible.length ? (
            <div className="cms-category-list">
              {visible.map((item) => (
                <article
                  key={item.id}
                  className={
                    draft.id === item.id
                      ? "cms-category-row active"
                      : "cms-category-row"
                  }
                >
                  <div>
                    <strong>{item.name}</strong>
                    <span>/tin-tuc/danh-muc/{item.slug}</span>
                    <small>
                      {item.articleCount} bài viết · thứ tự {item.sortOrder}
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
            <p className="cms-empty">Chưa có danh mục bài viết.</p>
          )}
        </section>
        <section className="panel cms-card cms-category-form">
          <div className="cms-section-head">
            <div>
              <p className="eyebrow">{editing ? "CHỈNH SỬA" : "TẠO MỚI"}</p>
              <h2>{editing ? draft.name : "Danh mục mới"}</h2>
            </div>
            {editing && (
              <button type="button" className="btn" onClick={() => edit()}>
                Hủy
              </button>
            )}
          </div>
          <label className="field">
            <span>Tên danh mục</span>
            <input
              className="input"
              value={draft.name}
              onChange={(event) => {
                const name = event.target.value;
                setDraft((current) => ({
                  ...current,
                  name,
                  slug:
                    current.id || current.slug ? current.slug : slugify(name),
                }));
              }}
              placeholder="VD: Thị trường"
            />
          </label>
          <label className="field">
            <span>Đường dẫn</span>
            <input
              className="input"
              value={draft.slug}
              onChange={(event) => set("slug", slugify(event.target.value))}
              placeholder="thi-truong"
            />
          </label>
          <label className="field">
            <span>
              Mô tả danh mục <small>{draft.description.length}/300</small>
            </span>
            <textarea
              className="input"
              maxLength={300}
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Giới thiệu ngắn về chủ đề của danh mục…"
            />
          </label>
          <label className="field">
            <span>Thứ tự hiển thị</span>
            <input
              className="input"
              type="number"
              value={draft.sortOrder}
              onChange={(event) =>
                set("sortOrder", Number(event.target.value) || 0)
              }
            />
          </label>
          <div className="cms-category-seo">
            <p className="eyebrow">SEO TRANG DANH MỤC</p>
            <label className="field">
              <span>
                Tiêu đề SEO <small>{draft.metaTitle.length}/65</small>
              </span>
              <input
                className="input"
                maxLength={70}
                value={draft.metaTitle}
                onChange={(event) => set("metaTitle", event.target.value)}
                placeholder={draft.name || "Tiêu đề trang danh mục"}
              />
            </label>
            <label className="field">
              <span>
                Mô tả SEO <small>{draft.metaDescription.length}/160</small>
              </span>
              <textarea
                className="input"
                maxLength={170}
                value={draft.metaDescription}
                onChange={(event) => set("metaDescription", event.target.value)}
                placeholder={draft.description || "Mô tả hiển thị trên Google"}
              />
            </label>
            <label className="field">
              <span>URL chính tắc</span>
              <input
                className="input"
                type="url"
                value={draft.canonicalUrl}
                onChange={(event) => set("canonicalUrl", event.target.value)}
                placeholder="https://gedeco.vn/tin-tuc/danh-muc/..."
              />
            </label>
            <div className="cms-google-preview">
              <small>
                gedeco.vn › tin-tuc › danh-muc › {draft.slug || "duong-dan"}
              </small>
              <strong>
                {draft.metaTitle || draft.name || "Tiêu đề trang danh mục"}
              </strong>
              <p>
                {draft.metaDescription ||
                  draft.description ||
                  "Mô tả danh mục sẽ xuất hiện tại đây."}
              </p>
            </div>
            <label className="cms-check">
              <input
                type="checkbox"
                checked={draft.robotsIndex}
                onChange={(event) => set("robotsIndex", event.target.checked)}
              />
              Cho phép lập chỉ mục
            </label>
            <label className="cms-check">
              <input
                type="checkbox"
                checked={draft.robotsFollow}
                onChange={(event) => set("robotsFollow", event.target.checked)}
              />
              Cho phép theo liên kết
            </label>
          </div>
          <button
            type="button"
            className="btn btn-primary cms-save-category"
            disabled={saving}
            onClick={() => void persist()}
          >
            <Icon name="check" size={16} />
            {saving ? "Đang lưu…" : "Lưu danh mục"}
          </button>
        </section>
      </div>
    </section>
  );
}
