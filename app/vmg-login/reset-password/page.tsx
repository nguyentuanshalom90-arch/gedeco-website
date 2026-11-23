"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "@/app/dashboard/dashboard.module.css";
import { resetPasswordWithToken } from "@/lib/dashboard/admin-actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError(true);
      setMessage("Liên kết không có mã token xác nhận. Vui lòng kiểm tra lại liên kết trong email.");
      return;
    }
    if (password.length < 6) {
      setError(true);
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError(true);
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const res = await resetPasswordWithToken(token, password);
      if (res.ok) {
        setSuccess(true);
        setMessage("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.");
        setTimeout(() => {
          router.push("/vmg-login");
        }, 2000);
      } else {
        setError(true);
        setMessage(res.error || "Không thể đặt lại mật khẩu.");
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
              <span className={styles.welcomeText}>Thiết lập</span>
              <span className={styles.dashboardText}>Mật khẩu mới</span>
            </h1>
          </div>

          {!token ? (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                fontSize: 13,
                background: "rgba(239,68,68,0.1)",
                color: "#dc2626",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã token. Vui lòng yêu cầu lại từ trang Quên mật khẩu.
            </div>
          ) : (
            <>
              <label className={styles.fieldLabel}>
                Mật khẩu mới
                <input
                  className={styles.input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  required
                  disabled={busy || success}
                  autoFocus
                />
              </label>

              <label className={styles.fieldLabel}>
                Xác nhận mật khẩu mới
                <input
                  className={styles.input}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  minLength={6}
                  required
                  disabled={busy || success}
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

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={busy || success}
              >
                {busy ? "Đang lưu…" : "Cập nhật mật khẩu"}
              </button>
            </>
          )}

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Đang tải…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
