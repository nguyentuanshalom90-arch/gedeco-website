import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const DASHBOARD_COOKIE = "gedeco_dashboard_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

type SessionPayload = {
  username: string;
  expiresAt: number;
};

function credentials() {
  const username = process.env.DASHBOARD_USERNAME?.trim();
  const password = process.env.DASHBOARD_PASSWORD;
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!username || !password || !secret || secret.length < 32)) {
    throw new Error("Dashboard production cần DASHBOARD_USERNAME, DASHBOARD_PASSWORD và DASHBOARD_SESSION_SECRET tối thiểu 32 ký tự.");
  }
  return {
    username: username || "admin",
    password: password || "Gedeco@2025!",
    secret: secret || "local-dashboard-session-secret-change-me",
  };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function verifyDashboardCredentials(username: string, password: string) {
  const expected = credentials();
  return safeEqual(username, expected.username) && safeEqual(password, expected.password);
}

export function createDashboardSession(username: string) {
  const { secret } = credentials();
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  } satisfies SessionPayload)).toString("base64url");
  return { value: `${payload}.${sign(payload, secret)}`, maxAge: SESSION_TTL_SECONDS };
}

export function verifyDashboardSession(value?: string | null): SessionPayload | null {
  if (!value) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;
  const { secret } = credentials();
  if (!safeEqual(signature, sign(payload, secret))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed.username || !Number.isFinite(parsed.expiresAt) || parsed.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getDashboardSession() {
  const store = await cookies();
  return verifyDashboardSession(store.get(DASHBOARD_COOKIE)?.value);
}

export async function requireDashboardSession() {
  const session = await getDashboardSession();
  if (!session) throw new Error("Phiên quản trị không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
  return session;
}
