"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import styles from "./dashboard.module.css";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/dashboard/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "Không thể đăng nhập.");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.authPage}>
      <div className={styles.authStack}>
        <div className={styles.brandLogoOutside}>
          <a className={styles.brandLogoLink} href="https://vimigo.vn/" target="_blank" rel="noopener noreferrer" aria-label="Mở website Vimigo.vn trong tab mới">
            <Image className={styles.brandLogo} src="/vimigo-admin-logo.webp" alt="Vimigo.vn" width={346} height={248} />
          </a>
        </div>
        <form className={styles.authCard} onSubmit={submit}>
          <div className={styles.authBrandRow}>
            <Image className={styles.authCardLogo} src="/assets/logo-new.optimized.webp" alt="GEDECO" width={1317} height={1194} />
            <h1><span className={styles.welcomeText}>Chào mừng</span><span className={styles.dashboardText}>Quản trị GEDECO</span></h1>
          </div>
          <label className={styles.fieldLabel}>Tên đăng nhập
            <input className={styles.input} type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" autoFocus required />
          </label>
          <label className={styles.fieldLabel}>Mật khẩu
            <input className={styles.input} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button className={styles.primaryButton} disabled={busy}>{busy ? "Đang đăng nhập…" : "Mở trang quản trị"}</button>
        </form>
      </div>
    </main>
  );
}
