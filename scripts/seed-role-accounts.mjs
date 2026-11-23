import { prisma } from "./prisma-client.mjs";
import crypto from "node:crypto";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const SEED_USERS = [
  {
    username: "quanlywebsite",
    displayName: "Quản lý Website",
    email: "webmaster@gedeco.vn",
    role: "WEBSITE_MANAGER",
    password: "WebMaster@2026!",
  },
  {
    username: "quanlynoidung",
    displayName: "Quản lý Nội dung",
    email: "content@gedeco.vn",
    role: "CONTENT_MANAGER",
    password: "ContentMgr@2026!",
  },
  {
    username: "quanlysanpham",
    displayName: "Quản lý Sản phẩm",
    email: "product@gedeco.vn",
    role: "PRODUCT_MANAGER",
    password: "ProductMgr@2026!",
  },
  {
    username: "quanlybaiviet",
    displayName: "Quản lý Bài viết",
    email: "editor@gedeco.vn",
    role: "POST_MANAGER",
    password: "PostMgr@2026!",
  },
];

async function seedRoleAccounts() {
  console.log("=== SEEDING 1 ACCOUNT FOR EACH ROLE ===");

  // 1. Ensure SUPER_ADMIN exists
  const superAdmin = await prisma.adminUser.findFirst({
    where: { username: "chucnguyen" },
  });
  if (superAdmin) {
    console.log(`[SUPER_ADMIN] @${superAdmin.username} (${superAdmin.email}) - Đã tồn tại.`);
  }

  // 2. Upsert the 4 role accounts
  for (const item of SEED_USERS) {
    const existing = await prisma.adminUser.findFirst({
      where: { username: item.username },
    });

    if (existing) {
      const updated = await prisma.adminUser.update({
        where: { id: existing.id },
        data: {
          displayName: item.displayName,
          email: item.email,
          role: item.role,
          isActive: true,
        },
      });
      console.log(`[UPDATED] @${updated.username} | ${updated.displayName} | Role: ${updated.role}`);
    } else {
      const created = await prisma.adminUser.create({
        data: {
          username: item.username,
          displayName: item.displayName,
          email: item.email,
          role: item.role,
          passwordHash: hashPassword(item.password),
          isActive: true,
        },
      });
      console.log(`[CREATED] @${created.username} | ${created.displayName} | Role: ${created.role}`);
    }
  }

  const allUsers = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
  });
  console.log(`\nTổng số quản trị viên hiện có: ${allUsers.length}`);
  allUsers.forEach((u, i) => {
    console.log(`  ${i + 1}. @${u.username} (${u.displayName}) - Role: ${u.role} - Email: ${u.email}`);
  });
}

seedRoleAccounts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
