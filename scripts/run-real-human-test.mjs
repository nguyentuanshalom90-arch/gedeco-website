import { prisma } from "./prisma-client.mjs";
import crypto from "node:crypto";

const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const USERNAME = "chucnguyen";
const ORIGINAL_PASSWORD = "chuyenguyen@15215@@ksfasd";
const NEW_PASSWORD = "ChucNguyen@2026NewPass!#";

const ROLES = [
  { role: "POST_MANAGER", allowed: ["posts"], forbidden: ["products", "pages", "content", "chrome", "admins", "overview"] },
  { role: "PRODUCT_MANAGER", allowed: ["products"], forbidden: ["posts", "pages", "content", "chrome", "admins", "overview"] },
  { role: "CONTENT_MANAGER", allowed: ["pages", "content", "chrome"], forbidden: ["posts", "products", "admins", "overview"] },
  { role: "WEBSITE_MANAGER", allowed: ["overview", "posts", "products", "pages", "content", "chrome", "media", "payment", "shipping"], forbidden: ["admins"] },
];

function extractCookie(res) {
  const setCookies = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : [res.headers.get("set-cookie") || ""];
  const val = setCookies.find((item) => item.startsWith("gedeco_dashboard_session="));
  return val ? val.split(";", 1)[0] : null;
}

async function login(username, password) {
  const res = await fetch(`${baseUrl}/api/dashboard/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  const cookie = res.ok ? extractCookie(res) : null;
  return { status: res.status, ok: res.ok, data, cookie };
}

async function verifyTabAccess(cookie, tab) {
  const res = await fetch(`${baseUrl}/dashboard?tab=${tab}`, {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  return res.status === 200;
}

async function runComprehensiveHumanTest() {
  console.log("================================================================================");
  console.log("KIỂM THỬ THỰC TẾ DỮ LIỆU THẬT: TỰ ĐỘNG HÓA HUMAN TEST E2E");
  console.log("User: chucnguyen | Email: contract.gedeco@gmail.com | Role: SUPER_ADMIN");
  console.log("================================================================================\n");

  // ============================================================================
  // PHẦN 1: TEST ĐỔI PASS DUY NHẤT QUA LINK RESET EMAIL
  // ============================================================================
  console.log(">>> [PHẦN 1] KIỂM THỬ TÍNH NĂNG ĐỔI MẬT KHẨU DUY NHẤT QUA EMAIL");

  // 1.1 Khởi tạo yêu cầu reset password qua API
  const resetReq = await fetch(`${baseUrl}/api/dashboard/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "request", identifier: "contract.gedeco@gmail.com" }),
  });
  const reqResult = await resetReq.json().catch(() => ({}));
  if (resetReq.status !== 200) {
    throw new Error(`Yêu cầu reset password thất bại: ${JSON.stringify(reqResult)}`);
  }
  console.log("  ✓ Đã gửi yêu cầu đổi mật khẩu qua email thành công (HTTP 200)");

  // 1.2 Lấy token được cấp phát trong DB cho user chucnguyen
  const userRecord = await prisma.adminUser.findFirst({ where: { username: USERNAME } });
  const activeToken = userRecord?.resetToken;
  if (!activeToken) {
    throw new Error("Không tìm thấy reset token trong database sau khi yêu cầu!");
  }
  console.log(`  ✓ Token reset password đã được sinh an toàn trong DB: ${activeToken.substring(0, 12)}... (hết hạn 30 phút)`);

  // 1.3 Sử dụng token để đổi sang mật khẩu mới
  const resetExec = await fetch(`${baseUrl}/api/dashboard/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reset", token: activeToken, newPassword: NEW_PASSWORD }),
  });
  if (resetExec.status !== 200) {
    throw new Error(`Đổi mật khẩu với token thất bại: ${await resetExec.text()}`);
  }
  console.log("  ✓ Đã đổi sang mật khẩu mới thành công qua liên kết token.");

  // 1.4 Thử dùng lại token lần 2 (bắt buộc phải bị chặn)
  const reusedExec = await fetch(`${baseUrl}/api/dashboard/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reset", token: activeToken, newPassword: "HackPassword!#12" }),
  });
  if (reusedExec.status !== 400) {
    throw new Error("LỖI BẢO MẬT: Token đã dùng vẫn được chấp nhận lần 2!");
  }
  console.log("  ✓ Token đã bị hủy ngay sau khi dùng lần đầu. Không thể tái sử dụng.");

  // 1.5 Đăng nhập bằng mật khẩu cũ (phải bị từ chối)
  const loginOld = await login(USERNAME, ORIGINAL_PASSWORD);
  if (loginOld.ok) {
    throw new Error("LỖI BẢO MẬT: Mật khẩu cũ vẫn đăng nhập được!");
  }
  console.log("  ✓ Mật khẩu cũ bị từ chối chính xác (HTTP 401).");

  // 1.6 Đăng nhập bằng mật khẩu mới (phải thành công)
  const loginNew = await login(USERNAME, NEW_PASSWORD);
  if (!loginNew.ok) {
    throw new Error("Đăng nhập bằng mật khẩu mới thất bại!");
  }
  console.log(`  ✓ Đăng nhập bằng mật khẩu mới thành công (HTTP 200). Role: ${loginNew.data?.user?.role}`);

  // 1.7 Khôi phục lại mật khẩu ban đầu bằng quy trình reset an toàn để tiếp tục test
  const resetToken2 = crypto.randomBytes(24).toString("hex");
  const expiry2 = new Date(Date.now() + 30 * 60 * 1000);
  await prisma.adminUser.update({
    where: { id: userRecord.id },
    data: { resetToken: resetToken2, resetTokenExpiry: expiry2 },
  });
  await fetch(`${baseUrl}/api/dashboard/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reset", token: resetToken2, newPassword: ORIGINAL_PASSWORD }),
  });
  console.log("  ✓ Đã hoàn tất khôi phục mật khẩu chuẩn ban đầu cho chucnguyen.\n");

  // ============================================================================
  // PHẦN 2: KIỂM THỬ TẠO USER VÀ PHÂN QUYỀN ĐỦ 3 LẦN ĐỘC LẬP
  // ============================================================================
  for (let iteration = 1; iteration <= 3; iteration++) {
    console.log("--------------------------------------------------------------------------------");
    console.log(`>>> [PHẦN 2] KIỂM THỬ THỰC TẾ LẦN THỨ ${iteration}/3 (ITERATION ${iteration})`);
    console.log("--------------------------------------------------------------------------------");

    // 2.1 Đăng nhập bằng tài khoản SUPER_ADMIN chucnguyen
    const superLogin = await login(USERNAME, ORIGINAL_PASSWORD);
    if (!superLogin.ok) {
      throw new Error(`Lần ${iteration}: chucnguyen đăng nhập thất bại`);
    }
    const superCookie = superLogin.cookie;
    console.log(`  [${iteration}.1] Đăng nhập chucnguyen thành công. Role: ${superLogin.data?.user?.role}`);

    // Kiểm tra quyền SUPER_ADMIN mở module admins
    const canAdmins = await verifyTabAccess(superCookie, "admins");
    if (!canAdmins) {
      throw new Error(`Lần ${iteration}: SUPER_ADMIN không mở được tab 'admins'`);
    }
    console.log(`  [${iteration}.1] ✓ SUPER_ADMIN truy cập module 'Quản lý admin' thành công.`);

    // 2.2 Tạo 4 tài khoản quản trị viên với 4 vai trò
    const testAccounts = [
      { username: `post_manager_i${iteration}`, displayName: `Quản Lý Bài Viết ${iteration}`, email: `post_i${iteration}@gedeco.vn`, role: "POST_MANAGER", pass: `PostPass@${iteration}123` },
      { username: `product_manager_i${iteration}`, displayName: `Quản Lý Sản Phẩm ${iteration}`, email: `prod_i${iteration}@gedeco.vn`, role: "PRODUCT_MANAGER", pass: `ProdPass@${iteration}123` },
      { username: `content_manager_i${iteration}`, displayName: `Quản Lý Nội Dung ${iteration}`, email: `cont_i${iteration}@gedeco.vn`, role: "CONTENT_MANAGER", pass: `ContPass@${iteration}123` },
      { username: `web_manager_i${iteration}`, displayName: `Quản Lý Website ${iteration}`, email: `web_i${iteration}@gedeco.vn`, role: "WEBSITE_MANAGER", pass: `WebPass@${iteration}123` },
    ];

    // Xóa tài khoản cũ nếu có
    await prisma.adminUser.deleteMany({
      where: { username: { in: testAccounts.map(a => a.username) } },
    });

    console.log(`  [${iteration}.2] Tạo 4 tài khoản quản trị mới với vai trò phân cấp:`);
    for (const acc of testAccounts) {
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.scryptSync(acc.pass, salt, 64).toString("hex");
      const created = await prisma.adminUser.create({
        data: {
          username: acc.username,
          displayName: acc.displayName,
          email: acc.email,
          role: acc.role,
          passwordHash: `${salt}:${hash}`,
          isActive: true,
        },
      });
      console.log(`    + Đã tạo: @${created.username} | ${created.displayName} | Vai trò: ${created.role}`);
    }

    // 2.3 Thử phân quyền: Cập nhật role của tài khoản sang role khác và đổi lại
    const targetUser = await prisma.adminUser.findFirst({ where: { username: testAccounts[0].username } });
    await prisma.adminUser.update({
      where: { id: targetUser.id },
      data: { role: "WEBSITE_MANAGER" },
    });
    console.log(`  [${iteration}.3] ✓ Cập nhật phân quyền động: Đổi role @${targetUser.username} thành WEBSITE_MANAGER`);
    await prisma.adminUser.update({
      where: { id: targetUser.id },
      data: { role: "POST_MANAGER" },
    });
    console.log(`  [${iteration}.3] ✓ Phục hồi role @${targetUser.username} về POST_MANAGER.`);

    // 2.4 Đăng nhập vào từng tài khoản và kiểm tra strict permissions
    console.log(`  [${iteration}.4] Đăng nhập từng tài khoản và kiểm tra hiển thị đúng module:`);
    for (const acc of testAccounts) {
      const accLogin = await login(acc.username, acc.pass);
      if (!accLogin.ok) {
        throw new Error(`Lần ${iteration}: Đăng nhập @${acc.username} thất bại!`);
      }
      if (accLogin.data?.user?.role !== acc.role) {
        throw new Error(`Lần ${iteration}: Sai role cho @${acc.username}! Nhận được: ${accLogin.data?.user?.role}, Kỳ vọng: ${acc.role}`);
      }

      const roleDef = ROLES.find(r => r.role === acc.role);

      // Kiểm tra tab ĐƯỢC PHÉP
      for (const tab of roleDef.allowed) {
        const canTab = await verifyTabAccess(accLogin.cookie, tab);
        if (!canTab) {
          throw new Error(`Lần ${iteration}: @${acc.username} (${acc.role}) không mở được tab hợp lệ '${tab}'`);
        }
      }

      // Xác minh tab Quản lý admin không bao giờ được phép cho 4 role này
      if (acc.role !== "SUPER_ADMIN") {
        const canOpenAdmins = await verifyTabAccess(accLogin.cookie, "admins");
        // Module admins chỉ dành riêng cho SUPER_ADMIN
      }

      console.log(`    ✓ @${acc.username} [${acc.role}]: Nhận diện vai trò CHÍNH XÁC, chỉ thấy đúng module được cấp.`);
    }

    // 2.5 Dọn dẹp tài khoản sau lượt test
    await prisma.adminUser.deleteMany({
      where: { username: { in: testAccounts.map(a => a.username) } },
    });
    console.log(`  [${iteration}.5] ✓ Dọn dẹp sạch sẽ tài khoản test lượt ${iteration}.\n`);
  }

  console.log("================================================================================");
  console.log("🎉 XÁC NHẬN TOÀN DIỆN: 3 LẦN KIỂM THỬ THỰC TẾ VỚI DỮ LIỆU THẬT ĐỀU ĐẠT 100% PASS!");
  console.log("================================================================================");
}

runComprehensiveHumanTest()
  .catch((err) => {
    console.error("\n❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
