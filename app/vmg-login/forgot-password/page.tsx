"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/app/dashboard/dashboard.module.css";
import { requestPasswordReset } from "@/lib/dashboard/admin-actions";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError(false);
    setDebugToken(null);
    try {
      const res = await requestPasswordReset(identifier, window.location.origin);
      if (res.ok) {
        setMessage(res.message);
        if (res.debugToken) {
          setDebugToken(res.debugToken);
        }
      } else {
        setError(true);
        setMessage(res.message || "Không thể gửi yêu cầu đặt lại mật khẩu.");
      }
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Lỗi hệ thống.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.authPage}>
      <div className={styles.authStack}>
        <div className={styles.brandLogoOutside}>
          <a
            className={styles.brandLogoLink}
            href="https://vimigo.vn/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mở website Vimigo.vn trong tab mới"
          >
            <Image
              className={styles.brandLogo}
              src="/vimigo-admin-logo.webp"
              alt="Vimigo.vn"
              width={346}
              height={248}
              unoptimized
            />
          </a>
        </div>
        <form className={styles.authCard} onSubmit={submit} aria-busy={busy}>
          <div className={styles.authBrandRow}>
            <Image
              className={styles.authCardLogo}
              src="/assets/logo-new.optimized.webp"
              alt="GEDECO"
              width={1317}
              height={1194}
              unoptimized
            />
            <h1>
              <span className={styles.welcomeText}>Khôi phục</span>
              <span className={styles.dashboardText}>Mật khẩu Admin</span>
            </h1>
          </div>

          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px", lineHeight: 1.5 }}>
            Nhập tên đăng nhập hoặc địa chỉ email đã đăng ký của bạn. Hệ thống sẽ gửi liên kết đặt lại mật khẩu qua email.
          </p>

          <label className={styles.fieldLabel}>
            Tên đăng nhập hoặc Email
            <input
              className={styles.input}
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin hoặc email@gedeco.vn"
              required
              disabled={busy}
              autoFocus
            />
          </label>

          {message ? (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.4,
                background: error ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                color: error ? "#dc2626" : "#059669",
                border: `1px solid ${error ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
              }}
            >
              {message}
            </div>
          ) : null}

          {debugToken && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 12,
                background: "#f0fdf4",
                border: "1px dashed #22c55e",
                color: "#166534",
              }}
            >
              <strong>Liên kết đặt lại mật khẩu nhanh:</strong>
              <div style={{ marginTop: 4 }}>
                <Link
                  href={`/vmg-login/reset-password?token=${debugToken}`}
                  style={{ color: "#2563eb", textDecoration: "underline", wordBreak: "break-all" }}
                >
                  Nhấn vào đây để đặt lại mật khẩu ngay
                </Link>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={busy}
          >
            {busy ? "Đang gửi email…" : "Gửi liên kết đặt lại mật khẩu"}
          </button>

          <div style={{ textAlign: "center", marginTop: 8 }}>
            <Link
              href="/vmg-login"
              style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}
            >
              ← Quay lại trang đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
