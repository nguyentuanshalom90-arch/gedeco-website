"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  toggleAdminUserActive,
  deleteAdminUser,
  requestPasswordReset,
  type AdminUserView,
  type CreateAdminInput,
} from "@/lib/dashboard/admin-actions";
import {
  ROLE_DEFINITIONS,
  ADMIN_ROLES_LIST,
  type AdminRole,
} from "@/lib/dashboard/roles";
import { Icon } from "@/components/vimigo-icon";

export function AdminUserManager({ currentUsername }: { currentUsername?: string }) {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal create state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInput, setCreateInput] = useState<CreateAdminInput>({
    username: "",
    email: "",
    displayName: "",
    password: "",
    role: "POST_MANAGER",
  });

  async function loadData() {
    setLoading(true);
    try {
      const res = await listAdminUsers();
      if (res.ok) {
        setUsers(res.users);
        setError(false);
      } else {
        setError(true);
        setMessage(res.error || "Không thể tải danh sách quản trị viên.");
      }
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole = filterRole === "ALL" || u.role === filterRole;
      const matchQuery =
        !q ||
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [users, filterRole, searchQuery]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const res = await createAdminUser(createInput);
      if (res.ok && res.user) {
        setMessage(`Đã tạo thành công tài khoản "${res.user.displayName}" với vai trò ${ROLE_DEFINITIONS[res.user.role].label}.`);
        setShowCreateModal(false);
        setCreateInput({
          username: "",
          email: "",
          displayName: "",
          password: "",
          role: "POST_MANAGER",
        });
        await loadData();
      } else {
        setError(true);
        setMessage(res.error || "Không thể tạo tài khoản.");
      }
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Lỗi hệ thống.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleChange(user: AdminUserView, newRole: AdminRole) {
    if (user.role === newRole) return;
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const res = await updateAdminUserRole(user.id, newRole);
      if (res.ok) {
        setMessage(`Đã đổi vai trò của "${user.displayName}" thành "${ROLE_DEFINITIONS[newRole].label}".`);
        await loadData();
      } else {
        setError(true);
        setMessage(res.error || "Không thể cập nhật vai trò.");
      }
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Lỗi hệ thống.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive(user: AdminUserView) {
    const nextStatus = !user.isActive;
    const confirmText = nextStatus
      ? `Kích hoạt lại tài khoản "${user.displayName}"?`
      : `Khóa tài khoản "${user.displayName}"? Người này sẽ không thể đăng nhập vào dashboard nữa.`;
    if (!window.confirm(confirmText)) return;

    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const res = await toggleAdminUserActive(user.id, nextStatus);
      if (res.ok) {
        setMessage(`Đã ${nextStatus ? "mở khóa" : "khóa"} tài khoản "${user.displayName}".`);
        await loadData();
      } else {
        setError(true);
        setMessage(res.error || "Không thể thay đổi trạng thái tài khoản.");
      }
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Lỗi hệ thống.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(user: AdminUserView) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.displayName}" (@${user.username})? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const res = await deleteAdminUser(user.id);
      if (res.ok) {
        setMessage(`Đã xóa tài khoản "${user.displayName}".`);
        await loadData();
      } else {
        setError(true);
        setMessage(res.error || "Không thể xóa tài khoản.");
      }
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Lỗi hệ thống.");
    } finally {
      setBusy(false);
    }
  }


  async function handleSendResetEmail(user: AdminUserView) {
    if (!window.confirm(`Gửi liên kết đặt lại mật khẩu tới email "${user.email}" của "${user.displayName}"?`)) {
      return;
    }
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const res = await requestPasswordReset(user.email, window.location.origin);
      if (res.ok) {
        setMessage(`Đã gửi email đặt lại mật khẩu cho "${user.displayName}". Vui lòng kiểm tra hòm thư.`);
      } else {
        setError(true);
        setMessage(res.message || "Không thể gửi email đặt lại mật khẩu.");
      }
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Lỗi gửi email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-user-manager" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="dashboard-view-head cms-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ letterSpacing: "0.08em", color: "var(--ink-mute)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            PHÂN QUYỀN HỆ THỐNG
          </p>
          <h1 className="disp" style={{ fontSize: 26, fontWeight: 800, margin: "4px 0", color: "#0a2540" }}>
            Quản lý admin
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: 0 }}>
            Phân quyền các quản trị viên theo 5 cấp vai trò, kiểm soát truy cập và bảo mật hệ thống.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, fontWeight: 600, border: "none", cursor: "pointer" }}
          onClick={() => {
            setShowCreateModal(true);
            setMessage("");
            setError(false);
          }}
          disabled={busy || loading}
        >
          <span>+ Thêm quản trị viên</span>
        </button>
      </div>

      {/* Notice Message */}
      {message && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            background: error ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
            color: error ? "#dc2626" : "#059669",
            border: `1px solid ${error ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
          }}
        >
          {message}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn"
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              background: filterRole === "ALL" ? "#0a2540" : "#f1f5f9",
              color: filterRole === "ALL" ? "#ffffff" : "#475569",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setFilterRole("ALL")}
          >
            Tất cả ({users.length})
          </button>
          {ADMIN_ROLES_LIST.map((rk) => (
            <button
              key={rk}
              type="button"
              className="btn"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: filterRole === rk ? ROLE_DEFINITIONS[rk].badgeColor : "#f8fafc",
                color: filterRole === rk ? "#ffffff" : "#475569",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
              }}
              onClick={() => setFilterRole(rk)}
            >
              {ROLE_DEFINITIONS[rk].label} ({users.filter((u) => u.role === rk).length})
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Tìm tên, username hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 13,
              width: 260,
              outline: "none",
            }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void loadData()}
            disabled={busy || loading}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            {loading ? "Đang tải…" : "Làm mới"}
          </button>
        </div>
      </div>

      {/* Users List Table */}
      <div className="panel" style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontWeight: 700, fontSize: 12 }}>
              <th style={{ padding: "12px 16px" }}>QUẢN TRỊ VIÊN</th>
              <th style={{ padding: "12px 16px" }}>EMAIL LIÊN HỆ</th>
              <th style={{ padding: "12px 16px" }}>VAI TRÒ / PHÂN QUYỀN</th>
              <th style={{ padding: "12px 16px" }}>TRẠNG THÁI</th>
              <th style={{ padding: "12px 16px" }}>NGÀY TẠO</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
                  Đang tải danh sách quản trị viên…
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
                  Không tìm thấy quản trị viên nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const roleDef = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.POST_MANAGER;
                // Tài khoản đang đăng nhập — khoá toàn bộ thao tác phân quyền + xóa
                const isSelf = !!(currentUsername && user.username === currentUsername);
                const avatarLetter = user.username.charAt(0).toUpperCase();
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: isSelf ? "rgba(37, 99, 235, 0.03)" : undefined,
                    }}
                  >
                    {/* User info */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: isSelf ? "#2563eb" : roleDef.badgeBg,
                            color: isSelf ? "#ffffff" : roleDef.badgeColor,
                            fontWeight: 800,
                            display: "grid",
                            placeItems: "center",
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {avatarLetter}
                        </div>
                        <div>
                          <strong style={{ display: "block", color: "#0f172a", fontSize: 13.5 }}>
                            @{user.username}
                            {isSelf && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: "#2563eb",
                                  color: "#fff",
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                  verticalAlign: "middle",
                                }}
                              >
                                Bạn
                              </span>
                            )}
                          </strong>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "12px 16px", color: "#334155" }}>
                      {user.email}
                    </td>

                    {/* Role — locked badge for self, dropdown for others */}
                    <td style={{ padding: "12px 16px" }}>
                      {isSelf ? (
                        <div
                          title="Bạn không thể tự thay đổi quyền của mình"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 10px",
                            borderRadius: 6,
                            fontSize: 12.5,
                            fontWeight: 700,
                            background: roleDef.badgeSolidBg,
                            color: roleDef.badgeColor,
                            border: `1px solid ${roleDef.badgeColor}`,
                            userSelect: "none",
                          }}
                        >
                          🔒 {roleDef.label}
                        </div>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => void handleRoleChange(user, e.target.value as AdminRole)}
                          disabled={busy}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 6,
                            fontSize: 12.5,
                            fontWeight: 700,
                            background: roleDef.badgeSolidBg,
                            color: roleDef.badgeColor,
                            border: `1px solid ${roleDef.badgeColor}`,
                            cursor: "pointer",
                          }}
                        >
                          {ADMIN_ROLES_LIST.map((rk) => (
                            <option key={rk} value={rk} style={{ background: "#ffffff", color: "#0f172a", fontWeight: 500 }}>
                              {ROLE_DEFINITIONS[rk].label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Active toggle — locked badge for self */}
                    <td style={{ padding: "12px 16px" }}>
                      {isSelf ? (
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#059669",
                            display: "inline-block",
                          }}
                        >
                          ● Hoạt động
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleToggleActive(user)}
                          disabled={busy}
                          style={{
                            padding: "3px 10px",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            background: user.isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                            color: user.isActive ? "#059669" : "#dc2626",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {user.isActive ? "● Hoạt động" : "✕ Đã khóa"}
                        </button>
                      )}
                    </td>

                    {/* Created date */}
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        {/* Chỉ đổi mật khẩu duy nhất qua liên kết gửi về email */}
                        <button
                          type="button"
                          className="btn"
                          title="Gửi link đổi mật khẩu qua email"
                          onClick={() => void handleSendResetEmail(user)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            background: "rgba(37, 99, 235, 0.08)",
                            color: "#2563eb",
                            border: "1px solid rgba(37, 99, 235, 0.3)",
                            cursor: "pointer",
                          }}
                        >
                          ✉ Gửi link đổi pass
                        </button>
                        {/* Nút Xóa — ẩn hoàn toàn với chính mình */}
                        {!isSelf && (
                          <button
                            type="button"
                            className="btn"
                            title="Xóa tài khoản"
                            onClick={() => void handleDelete(user)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              background: "rgba(239, 68, 68, 0.08)",
                              color: "#dc2626",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              cursor: "pointer",
                            }}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Thêm quản trị viên mới */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 37, 64, 0.6)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 14,
              padding: 24,
              maxWidth: 540,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <p className="eyebrow" style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", margin: 0 }}>
                  TẠO TÀI KHOẢN MỚI
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "2px 0 0", color: "#0f172a" }}>
                  Thêm quản trị viên &amp; Cấp quyền
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                <span>Họ và tên hiển thị <span style={{ color: "#ef4444" }}>*</span></span>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Hoàng"
                  value={createInput.displayName}
                  onChange={(e) => setCreateInput({ ...createInput, displayName: e.target.value })}
                  style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  <span>Tên đăng nhập <span style={{ color: "#ef4444" }}>*</span></span>
                  <input
                    type="text"
                    required
                    placeholder="vd: bientap_01"
                    value={createInput.username}
                    onChange={(e) => setCreateInput({ ...createInput, username: e.target.value })}
                    style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  <span>Mật khẩu ban đầu <span style={{ color: "#ef4444" }}>*</span></span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                    value={createInput.password}
                    onChange={(e) => setCreateInput({ ...createInput, password: e.target.value })}
                    style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
                  />
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                <span>Email quản trị viên (dùng để reset mật khẩu) <span style={{ color: "#ef4444" }}>*</span></span>
                <input
                  type="email"
                  required
                  placeholder="admin@gedeco.vn"
                  value={createInput.email}
                  onChange={(e) => setCreateInput({ ...createInput, email: e.target.value })}
                  style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                <span>Cấp vai trò quản trị <span style={{ color: "#ef4444" }}>*</span></span>
                <select
                  value={createInput.role}
                  onChange={(e) => setCreateInput({ ...createInput, role: e.target.value as AdminRole })}
                  style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", fontWeight: 700 }}
                >
                  {ADMIN_ROLES_LIST.map((rk) => (
                    <option key={rk} value={rk}>
                      {ROLE_DEFINITIONS[rk].label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Role detail box */}
              <div style={{ background: ROLE_DEFINITIONS[createInput.role].badgeBg, padding: 12, borderRadius: 8, border: `1px solid ${ROLE_DEFINITIONS[createInput.role].badgeColor}` }}>
                <strong style={{ color: ROLE_DEFINITIONS[createInput.role].badgeColor, fontSize: 13, display: "block", marginBottom: 4 }}>
                  Quyền hạn vai trò: {ROLE_DEFINITIONS[createInput.role].label}
                </strong>
                <p style={{ fontSize: 12, color: "#334155", margin: "0 0 6px", lineHeight: 1.4 }}>
                  {ROLE_DEFINITIONS[createInput.role].description}
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: "#475569" }}>
                  {ROLE_DEFINITIONS[createInput.role].detailedPermissions.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 2 }}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 600 }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy}
                  style={{ padding: "9px 20px", borderRadius: 8, background: "#2563eb", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                >
                  {busy ? "Đang lưu…" : "Tạo quản trị viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
