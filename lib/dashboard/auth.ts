import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AdminRole } from "./roles";

export const DASHBOARD_COOKIE = "gedeco_dashboard_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export type SessionPayload = {
  username: string;
  userId?: string;
  displayName?: string;
  role: AdminRole;
  expiresAt: number;
};

export type AdminAuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: AdminRole;
};

function getCredentialsEnv() {
  const username = process.env.DASHBOARD_USERNAME?.trim();
  const password = process.env.DASHBOARD_PASSWORD;
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!username || !password || !secret || secret.length < 32) {
    throw new Error("Dashboard cần DASHBOARD_USERNAME, DASHBOARD_PASSWORD và DASHBOARD_SESSION_SECRET tối thiểu 32 ký tự.");
  }
  return { username, password, secret };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return keyBuffer.length === derivedKey.length && crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Ensures at least one SUPER_ADMIN user exists in the database.
 */
export async function ensureDefaultSuperAdmin(): Promise<void> {
  const env = getCredentialsEnv();
  const existingCount = await prisma.adminUser.count();
  if (existingCount === 0) {
    await prisma.adminUser.upsert({
      where: { username: env.username },
      update: {},
      create: {
        username: env.username,
        email: "admin@gedeco.vn",
        passwordHash: hashPassword(env.password),
        displayName: "Admin cao nhất",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
  }
}

export async function verifyDashboardCredentials(
  username: string,
  password: string,
): Promise<{ valid: boolean; user?: AdminAuthUser; error?: string }> {
  const env = getCredentialsEnv();
  if (!username || !password) {
    return { valid: false, error: "Tên đăng nhập và mật khẩu không được để trống." };
  }

  // Check database first
  const dbUser = await prisma.adminUser.findFirst({
    where: {
      OR: [
        { username: { equals: username, mode: "insensitive" } },
        { email: { equals: username, mode: "insensitive" } },
      ],
    },
  });

  if (dbUser) {
    if (!dbUser.isActive) {
      return { valid: false, error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin cao nhất." };
    }
    if (verifyPassword(password, dbUser.passwordHash)) {
      return {
        valid: true,
        user: {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          displayName: dbUser.displayName,
          role: dbUser.role as AdminRole,
        },
      };
    }
    return { valid: false, error: "Mật khẩu không chính xác." };
  }

  // Fallback to environment variables only if user does not exist in DB yet (initial bootstrap)
  if (safeEqual(username, env.username) && safeEqual(password, env.password)) {
    // Upsert to ensure record exists in DB
    const admin = await prisma.adminUser.upsert({
      where: { username: env.username },
      update: {
        passwordHash: hashPassword(env.password),
        isActive: true,
        role: "SUPER_ADMIN",
      },
      create: {
        username: env.username,
        email: "admin@gedeco.vn",
        passwordHash: hashPassword(env.password),
        displayName: "Admin cao nhất",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
    return {
      valid: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role as AdminRole,
      },
    };
  }

  return { valid: false, error: "Tên đăng nhập hoặc mật khẩu không đúng." };
}

export function createDashboardSession(
  user: string | { username: string; role?: AdminRole; displayName?: string; userId?: string },
) {
  const { secret } = getCredentialsEnv();
  const username = typeof user === "string" ? user : user.username;
  const role: AdminRole = typeof user === "object" && user.role ? user.role : "SUPER_ADMIN";
  const displayName = typeof user === "object" && user.displayName ? user.displayName : username;
  const userId = typeof user === "object" ? user.userId : undefined;

  const payload = Buffer.from(
    JSON.stringify({
      username,
      userId,
      displayName,
      role,
      expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    } satisfies SessionPayload),
  ).toString("base64url");

  return { value: `${payload}.${sign(payload, secret)}`, maxAge: SESSION_TTL_SECONDS };
}

export function verifyDashboardSession(value?: string | null): SessionPayload | null {
  if (!value) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;
  const expected = getCredentialsEnv();
  if (!safeEqual(signature, sign(payload, expected.secret))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (
      !parsed.username ||
      typeof parsed.username !== "string" ||
      !Number.isFinite(parsed.expiresAt) ||
      (parsed.expiresAt as number) <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    const role: AdminRole = parsed.role && ["SUPER_ADMIN", "WEBSITE_MANAGER", "CONTENT_MANAGER", "PRODUCT_MANAGER", "POST_MANAGER"].includes(parsed.role)
      ? (parsed.role as AdminRole)
      : "SUPER_ADMIN";

    return {
      username: parsed.username,
      userId: parsed.userId,
      displayName: parsed.displayName || parsed.username,
      role,
      expiresAt: parsed.expiresAt as number,
    };
  } catch {
    return null;
  }
}

export async function getDashboardSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const rawSession = verifyDashboardSession(store.get(DASHBOARD_COOKIE)?.value);
  if (!rawSession) return null;

  // Real-time lookup from database: ensure role & active state are always live
  try {
    const dbUser = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: { equals: rawSession.username, mode: "insensitive" } },
          ...(rawSession.userId ? [{ id: rawSession.userId }] : []),
        ],
      },
    });

    if (dbUser) {
      if (!dbUser.isActive) {
        return null;
      }
      return {
        username: dbUser.username,
        userId: dbUser.id,
        displayName: dbUser.displayName,
        role: dbUser.role as AdminRole,
        expiresAt: rawSession.expiresAt,
      };
    }
  } catch {
    // If DB is temporarily unavailable, fall back to validated cookie payload
  }

  return rawSession;
}

export async function requireDashboardSession(allowedRoles?: AdminRole[]) {
  const session = await getDashboardSession();
  if (!session) {
    throw new Error("Phiên quản trị không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
  }
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.role)) {
      throw new Error(`Bạn không có quyền thực hiện thao tác này (yêu cầu vai trò: ${allowedRoles.join(", ")}).`);
    }
  }
  return session;
}
