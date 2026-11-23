"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  requireDashboardSession,
} from "./auth";
import {
  ADMIN_ROLES_LIST,
  type AdminRole,
} from "./roles";
import { sendPasswordResetEmail } from "@/lib/mail";

export type AdminUserView = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminInput = {
  username: string;
  email: string;
  displayName: string;
  password: string;
  role: AdminRole;
};

function sanitizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function listAdminUsers(): Promise<{
  ok: boolean;
  users: AdminUserView[];
  error?: string;
}> {
  try {
    const session = await requireDashboardSession();
    if (session.role !== "SUPER_ADMIN") {
      return { ok: false, users: [], error: "Chỉ Admin cao nhất mới có quyền xem danh sách quản trị viên." };
    }

    const rows = await prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
    });

    const users: AdminUserView[] = rows.map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      displayName: row.displayName,
      role: row.role as AdminRole,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    return { ok: true, users };
  } catch (error) {
    return {
      ok: false,
      users: [],
      error: error instanceof Error ? error.message : "Không thể tải danh sách quản trị viên.",
    };
  }
}

export async function createAdminUser(
  input: CreateAdminInput,
): Promise<{ ok: boolean; user?: AdminUserView; error?: string }> {
  try {
    const session = await requireDashboardSession();
    if (session.role !== "SUPER_ADMIN") {
      return { ok: false, error: "Chỉ Admin cao nhất mới có quyền tạo tài khoản và phân quyền." };
    }

    const username = sanitizeUsername(input.username);
    const email = input.email.trim().toLowerCase();
    const displayName = input.displayName.trim();
    const password = input.password;
    const role = input.role;

    if (!username || username.length < 3 || username.length > 30) {
      return { ok: false, error: "Tên đăng nhập phải từ 3 đến 30 ký tự." };
    }
    if (!/^[a-z0-9_.-]+$/.test(username)) {
      return { ok: false, error: "Tên đăng nhập chỉ chứa chữ cái, số, dấu gạch dưới hoặc gạch nối." };
    }
    if (!validateEmail(email)) {
      return { ok: false, error: "Địa chỉ email không đúng định dạng." };
    }
    if (!displayName || displayName.length < 2) {
      return { ok: false, error: "Tên hiển thị phải có ít nhất 2 ký tự." };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: "Mật khẩu phải có ít nhất 6 ký tự." };
    }
    if (!ADMIN_ROLES_LIST.includes(role)) {
      return { ok: false, error: "Vai trò quản trị viên không hợp lệ." };
    }

    const existingUser = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username) {
        return { ok: false, error: "Tên đăng nhập này đã được sử dụng." };
      }
      return { ok: false, error: "Địa chỉ email này đã được sử dụng cho một tài khoản khác." };
    }

    const passwordHash = hashPassword(password);
    const created = await prisma.adminUser.create({
      data: {
        username,
        email,
        displayName,
        passwordHash,
        role,
        isActive: true,
      },
    });

    return {
      ok: true,
      user: {
        id: created.id,
        username: created.username,
        email: created.email,
        displayName: created.displayName,
        role: created.role as AdminRole,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi khi tạo tài khoản quản trị.",
    };
  }
}

export async function updateAdminUserRole(
  id: string,
  newRole: AdminRole,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireDashboardSession();
    if (session.role !== "SUPER_ADMIN") {
      return { ok: false, error: "Chỉ Admin cao nhất mới có quyền phân quyền quản trị viên." };
    }

    if (!ADMIN_ROLES_LIST.includes(newRole)) {
      return { ok: false, error: "Vai trò không hợp lệ." };
    }

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) {
      return { ok: false, error: "Không tìm thấy tài khoản quản trị viên." };
    }

    // Safety: Cannot demote oneself from SUPER_ADMIN
    if (target.username === session.username && newRole !== "SUPER_ADMIN") {
      return { ok: false, error: "Bạn không thể tự hạ quyền của chính mình." };
    }

    await prisma.adminUser.update({
      where: { id },
      data: { role: newRole },
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi khi cập nhật vai trò quản trị viên.",
    };
  }
}

export async function toggleAdminUserActive(
  id: string,
  isActive: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireDashboardSession();
    if (session.role !== "SUPER_ADMIN") {
      return { ok: false, error: "Chỉ Admin cao nhất mới có quyền khóa/mở khóa tài khoản." };
    }

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) {
      return { ok: false, error: "Không tìm thấy tài khoản." };
    }

    if (target.username === session.username && !isActive) {
      return { ok: false, error: "Bạn không thể tự khóa tài khoản của chính mình." };
    }

    await prisma.adminUser.update({
      where: { id },
      data: { isActive },
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi khi cập nhật trạng thái tài khoản.",
    };
  }
}

export async function deleteAdminUser(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireDashboardSession();
    if (session.role !== "SUPER_ADMIN") {
      return { ok: false, error: "Chỉ Admin cao nhất mới có quyền xóa tài khoản." };
    }

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) {
      return { ok: false, error: "Không tìm thấy tài khoản để xóa." };
    }

    if (target.username === session.username) {
      return { ok: false, error: "Bạn không thể xóa tài khoản của chính mình." };
    }

    if (target.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.adminUser.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (superAdminCount <= 1) {
        return { ok: false, error: "Hệ thống phải có ít nhất một tài khoản Admin cao nhất." };
      }
    }

    await prisma.adminUser.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi khi xóa tài khoản.",
    };
  }
}

export async function changeAdminPassword(): Promise<{ ok: boolean; error?: string }> {
  return {
    ok: false,
    error: "Hệ thống chỉ cho phép đổi mật khẩu duy nhất qua phương thức gửi liên kết reset về email.",
  };
}

export async function requestPasswordReset(
  identifier: string,
  originUrl?: string,
): Promise<{ ok: boolean; message: string; debugToken?: string }> {
  try {
    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return {
        ok: false,
        message: "Vui lòng nhập tên đăng nhập hoặc email.",
      };
    }

    const user = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: { equals: clean, mode: "insensitive" } },
          { email: { equals: clean, mode: "insensitive" } },
        ],
        isActive: true,
      },
    });

    if (!user) {
      // Do not reveal if user does not exist
      return {
        ok: true,
        message: "Nếu thông tin khớp với tài khoản quản trị hợp lệ, hệ thống đã gửi liên kết đặt lại mật khẩu đến email của bạn.",
      };
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: expiry,
      },
    });

    const host = originUrl || process.env.SITE_URL || "http://localhost:3000";
    const resetUrl = `${host.replace(/\/+$/, "")}/vmg-login/reset-password?token=${resetToken}`;

    const sendResult = await sendPasswordResetEmail({
      to: user.email,
      displayName: user.displayName,
      resetUrl,
      resetToken,
    });

    return {
      ok: true,
      message: "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả mục Spam).",
      // Include debugToken in non-production for automated testing / audit
      debugToken: process.env.NODE_ENV !== "production" || !sendResult.ok ? resetToken : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Lỗi khi xử lý yêu cầu đặt lại mật khẩu.",
    };
  }
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { ok: false, error: "Mã xác nhận hoặc liên kết đặt lại mật khẩu không hợp lệ." };
    }
    if (!newPassword || newPassword.length < 6) {
      return { ok: false, error: "Mật khẩu mới phải có ít nhất 6 ký tự." };
    }

    const user = await prisma.adminUser.findFirst({
      where: {
        resetToken: cleanToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
        isActive: true,
      },
    });

    if (!user) {
      return { ok: false, error: "Mã token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (sau 30 phút)." };
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(newPassword),
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi khi cập nhật mật khẩu mới.",
    };
  }
}
