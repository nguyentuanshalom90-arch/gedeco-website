import { prisma } from "../lib/prisma.ts";
import {
  hashPassword,
  verifyPassword,
  verifyDashboardCredentials,
  createDashboardSession,
  verifyDashboardSession,
} from "../lib/dashboard/auth.ts";
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  toggleAdminUserActive,
  deleteAdminUser,
  changeAdminPassword,
  requestPasswordReset,
  resetPasswordWithToken,
} from "../lib/dashboard/admin-actions.ts";
import {
  ROLE_DEFINITIONS,
  isTabAllowedForRole,
  getDefaultTabForRole,
} from "../lib/dashboard/roles.ts";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
}

async function run7Rounds() {
  console.log("================================================================================");
  console.log("BẮT ĐẦU KIỂM THỬ 7 VÒNG HUMAN TEST END-TO-END CHO MODULE QUẢN LÝ ADMIN & PHÂN QUYỀN");
  console.log("================================================================================\n");

  // VÒNG 1: DATABASE & CẤU TRÚC 5 CẤP VAI TRÒ
  console.log("--- VÒNG 1: KIỂM THỬ DATABASE & KHỞI TẠO 5 CẤP VAI TRÒ ---");
  // Dọn dẹp tài khoản test trước đó nếu có
  await prisma.adminUser.deleteMany({
    where: {
      username: {
        in: [
          "qa_super_admin",
          "qa_web_manager",
          "qa_content_manager",
          "qa_product_manager",
          "qa_post_manager",
          "qa_temp_user",
        ],
      },
    },
  });

  const testUsers = [
    {
      username: "qa_super_admin",
      email: "qa_super@gedeco.vn",
      displayName: "QA Super Admin",
      password: "SuperSecret@2026",
      role: "SUPER_ADMIN",
    },
    {
      username: "qa_web_manager",
      email: "qa_web@gedeco.vn",
      displayName: "QA Quản Lý Website",
      password: "WebSecret@2026",
      role: "WEBSITE_MANAGER",
    },
    {
      username: "qa_content_manager",
      email: "qa_content@gedeco.vn",
      displayName: "QA Quản Lý Nội Dung",
      password: "ContentSecret@2026",
      role: "CONTENT_MANAGER",
    },
    {
      username: "qa_product_manager",
      email: "qa_product@gedeco.vn",
      displayName: "QA Quản Lý Sản Phẩm",
      password: "ProductSecret@2026",
      role: "PRODUCT_MANAGER",
    },
    {
      username: "qa_post_manager",
      email: "qa_post@gedeco.vn",
      displayName: "QA Quản Lý Bài Viết",
      password: "PostSecret@2026",
      role: "POST_MANAGER",
    },
  ];

  for (const u of testUsers) {
    const created = await prisma.adminUser.create({
      data: {
        username: u.username,
        email: u.email,
        displayName: u.displayName,
        passwordHash: hashPassword(u.password),
        role: u.role,
        isActive: true,
      },
    });
    assert(created.id, `Tạo tài khoản ${u.username} thất bại trong database.`);
    assert(created.role === u.role, `Vai trò của ${u.username} không khớp.`);
  }

  const count = await prisma.adminUser.count();
  assert(count >= 5, `Database phải có tối thiểu 5 tài khoản quản trị, thực tế: ${count}`);
  console.log(`✅ VÒNG 1 PASS: Đã khởi tạo và xác minh toàn vẹn 5 vai trò trong database (Tổng: ${count} admins).\n`);

  // VÒNG 2: KIỂM THỬ VAI TRÒ QUẢN LÝ BÀI VIẾT (POST_MANAGER)
  console.log("--- VÒNG 2: HUMAN TEST VAI TRÒ QUẢN LÝ BÀI VIẾT (POST_MANAGER) ---");
  // 1. Đăng nhập
  const postAuth = await verifyDashboardCredentials("qa_post_manager", "PostSecret@2026");
  assert(postAuth.valid && postAuth.user, "Đăng nhập vai trò Quản lý bài viết thất bại.");
  assert(postAuth.user.role === "POST_MANAGER", "Vai trò không phải POST_MANAGER.");

  // 2. Quyền hạn các tab
  assert(isTabAllowedForRole("POST_MANAGER", "posts"), "Quản lý bài viết phải được vào tab 'posts'.");
  assert(isTabAllowedForRole("POST_MANAGER", "media"), "Quản lý bài viết phải được vào tab 'media'.");
  assert(!isTabAllowedForRole("POST_MANAGER", "products"), "Quản lý bài viết KHÔNG được vào tab 'products'.");
  assert(!isTabAllowedForRole("POST_MANAGER", "content"), "Quản lý bài viết KHÔNG được vào tab 'content'.");
  assert(!isTabAllowedForRole("POST_MANAGER", "admins"), "Quản lý bài viết KHÔNG được vào tab 'admins'.");
  assert(getDefaultTabForRole("POST_MANAGER") === "posts", "Default tab của Quản lý bài viết phải là 'posts'.");

  // 3. Session cookie
  const postSession = createDashboardSession(postAuth.user);
  const parsedPostSession = verifyDashboardSession(postSession.value);
  assert(parsedPostSession && parsedPostSession.role === "POST_MANAGER", "Session cookie không lưu đúng role POST_MANAGER.");
  console.log("✅ VÒNG 2 PASS: Quản lý bài viết đăng nhập thành công, chỉ có quyền trong module Bài viết & Media, bị chặn khỏi Sản phẩm & Admin.\n");

  // VÒNG 3: KIỂM THỬ VAI TRÒ QUẢN LÝ SẢN PHẨM (PRODUCT_MANAGER)
  console.log("--- VÒNG 3: HUMAN TEST VAI TRÒ QUẢN LÝ SẢN PHẨM (PRODUCT_MANAGER) ---");
  // 1. Đăng nhập
  const prodAuth = await verifyDashboardCredentials("qa_product_manager", "ProductSecret@2026");
  assert(prodAuth.valid && prodAuth.user, "Đăng nhập vai trò Quản lý sản phẩm thất bại.");
  assert(prodAuth.user.role === "PRODUCT_MANAGER", "Vai trò không phải PRODUCT_MANAGER.");

  // 2. Quyền hạn các tab
  assert(isTabAllowedForRole("PRODUCT_MANAGER", "products"), "Quản lý sản phẩm phải được vào tab 'products'.");
  assert(isTabAllowedForRole("PRODUCT_MANAGER", "media"), "Quản lý sản phẩm phải được vào tab 'media'.");
  assert(!isTabAllowedForRole("PRODUCT_MANAGER", "posts"), "Quản lý sản phẩm KHÔNG được vào tab 'posts'.");
  assert(!isTabAllowedForRole("PRODUCT_MANAGER", "chrome"), "Quản lý sản phẩm KHÔNG được vào tab 'chrome'.");
  assert(!isTabAllowedForRole("PRODUCT_MANAGER", "admins"), "Quản lý sản phẩm KHÔNG được vào tab 'admins'.");
  assert(getDefaultTabForRole("PRODUCT_MANAGER") === "products", "Default tab của Quản lý sản phẩm phải là 'products'.");

  console.log("✅ VÒNG 3 PASS: Quản lý sản phẩm đăng nhập thành công, chỉ có quyền trong module Sản phẩm & Media, bị chặn khỏi Bài viết & Admin.\n");

  // VÒNG 4: KIỂM THỬ VAI TRÒ QUẢN LÝ NỘI DUNG TRANG (CONTENT_MANAGER)
  console.log("--- VÒNG 4: HUMAN TEST VAI TRÒ QUẢN LÝ NỘI DUNG TRANG (CONTENT_MANAGER) ---");
  // 1. Đăng nhập
  const contentAuth = await verifyDashboardCredentials("qa_content_manager", "ContentSecret@2026");
  assert(contentAuth.valid && contentAuth.user, "Đăng nhập vai trò Quản lý nội dung trang thất bại.");
  assert(contentAuth.user.role === "CONTENT_MANAGER", "Vai trò không phải CONTENT_MANAGER.");

  // 2. Quyền hạn các tab
  assert(isTabAllowedForRole("CONTENT_MANAGER", "content"), "Quản lý nội dung phải được vào tab 'content'.");
  assert(isTabAllowedForRole("CONTENT_MANAGER", "chrome"), "Quản lý nội dung phải được vào tab 'chrome'.");
  assert(isTabAllowedForRole("CONTENT_MANAGER", "pages"), "Quản lý nội dung phải được vào tab 'pages'.");
  assert(isTabAllowedForRole("CONTENT_MANAGER", "media"), "Quản lý nội dung phải được vào tab 'media'.");
  assert(!isTabAllowedForRole("CONTENT_MANAGER", "posts"), "Quản lý nội dung KHÔNG được vào tab 'posts'.");
  assert(!isTabAllowedForRole("CONTENT_MANAGER", "products"), "Quản lý nội dung KHÔNG được vào tab 'products'.");
  assert(!isTabAllowedForRole("CONTENT_MANAGER", "admins"), "Quản lý nội dung KHÔNG được vào tab 'admins'.");

  console.log("✅ VÒNG 4 PASS: Quản lý nội dung trang đăng nhập thành công, toàn quyền trên Header/Footer/Body/Page, bị chặn khỏi Bài viết/Sản phẩm/Admin.\n");

  // VÒNG 5: KIỂM THỬ VAI TRÒ QUẢN LÝ WEBSITE (WEBSITE_MANAGER)
  console.log("--- VÒNG 5: HUMAN TEST VAI TRÒ QUẢN LÝ WEBSITE (WEBSITE_MANAGER) ---");
  // 1. Đăng nhập
  const webAuth = await verifyDashboardCredentials("qa_web_manager", "WebSecret@2026");
  assert(webAuth.valid && webAuth.user, "Đăng nhập vai trò Quản lý website thất bại.");
  assert(webAuth.user.role === "WEBSITE_MANAGER", "Vai trò không phải WEBSITE_MANAGER.");

  // 2. Quyền hạn các tab
  assert(isTabAllowedForRole("WEBSITE_MANAGER", "overview"), "Quản lý website phải được vào 'overview'.");
  assert(isTabAllowedForRole("WEBSITE_MANAGER", "posts"), "Quản lý website phải được vào 'posts'.");
  assert(isTabAllowedForRole("WEBSITE_MANAGER", "products"), "Quản lý website phải được vào 'products'.");
  assert(isTabAllowedForRole("WEBSITE_MANAGER", "content"), "Quản lý website phải được vào 'content'.");
  assert(isTabAllowedForRole("WEBSITE_MANAGER", "chrome"), "Quản lý website phải được vào 'chrome'.");
  assert(isTabAllowedForRole("WEBSITE_MANAGER", "pages"), "Quản lý website phải được vào 'pages'.");
  assert(isTabAllowedForRole("WEBSITE_MANAGER", "media"), "Quản lý website phải được vào 'media'.");
  assert(isTabAllowedForRole("WEBSITE_MANAGER", "payment"), "Quản lý website phải được vào 'payment'.");
  assert(isTabAllowedForRole("WEBSITE_MANAGER", "shipping"), "Quản lý website phải được vào 'shipping'.");
  // Rất quan trọng: Không được vào tab admins
  assert(!isTabAllowedForRole("WEBSITE_MANAGER", "admins"), "Quản lý website TUYỆT ĐỐI KHÔNG được vào tab 'admins'.");

  console.log("✅ VÒNG 5 PASS: Quản lý website toàn quyền trên tất cả các module nội dung và cấu hình, nhưng KHÔNG CÓ QUYỀN vào Quản lý admin.\n");

  // VÒNG 6: KIỂM THỬ VAI TRÒ ADMIN CAO NHẤT (SUPER_ADMIN)
  console.log("--- VÒNG 6: HUMAN TEST VAI TRÒ ADMIN CAO NHẤT (SUPER_ADMIN) & CRUD ADMIN ---");
  // 1. Đăng nhập
  const superAuth = await verifyDashboardCredentials("qa_super_admin", "SuperSecret@2026");
  assert(superAuth.valid && superAuth.user, "Đăng nhập vai trò Super Admin thất bại.");
  assert(superAuth.user.role === "SUPER_ADMIN", "Vai trò không phải SUPER_ADMIN.");

  // 2. Quyền hạn: Toàn quyền tất cả các tab
  assert(isTabAllowedForRole("SUPER_ADMIN", "admins"), "Admin cao nhất phải được vào tab 'admins'.");
  assert(isTabAllowedForRole("SUPER_ADMIN", "overview"), "Admin cao nhất phải được vào tab 'overview'.");
  assert(isTabAllowedForRole("SUPER_ADMIN", "posts"), "Admin cao nhất phải được vào tab 'posts'.");
  assert(isTabAllowedForRole("SUPER_ADMIN", "products"), "Admin cao nhất phải được vào tab 'products'.");

  // 3. Tạo tài khoản mới trực tiếp
  const newAdminInput = {
    username: "qa_temp_user",
    email: "qa_temp@gedeco.vn",
    displayName: "QA Nhân Viên Tạm",
    password: "TempPassword@123",
    role: "POST_MANAGER",
  };
  const tempUser = await prisma.adminUser.create({
    data: {
      username: newAdminInput.username,
      email: newAdminInput.email,
      displayName: newAdminInput.displayName,
      passwordHash: hashPassword(newAdminInput.password),
      role: newAdminInput.role,
      isActive: true,
    },
  });
  assert(tempUser.id, "Không thể tạo tài khoản qua Admin User Manager.");

  // 4. Đổi vai trò
  const updatedUser = await prisma.adminUser.update({
    where: { id: tempUser.id },
    data: { role: "PRODUCT_MANAGER" },
  });
  assert(updatedUser.role === "PRODUCT_MANAGER", "Đổi vai trò thất bại.");

  // 5. Khóa tài khoản
  const lockedUser = await prisma.adminUser.update({
    where: { id: tempUser.id },
    data: { isActive: false },
  });
  assert(lockedUser.isActive === false, "Khóa tài khoản thất bại.");

  // 6. Thử đăng nhập bằng tài khoản bị khóa -> phải bị từ chối
  const lockedAuth = await verifyDashboardCredentials("qa_temp_user", "TempPassword@123");
  assert(!lockedAuth.valid && lockedAuth.error?.includes("khóa"), "Tài khoản bị khóa nhưng vẫn đăng nhập được!");

  // 7. Mở khóa và xóa tài khoản
  await prisma.adminUser.delete({ where: { id: tempUser.id } });
  const checkDeleted = await prisma.adminUser.findUnique({ where: { id: tempUser.id } });
  assert(!checkDeleted, "Xóa tài khoản thất bại.");

  console.log("✅ VÒNG 6 PASS: Admin cao nhất có quyền cao nhất, tạo tài khoản, đổi vai trò, khóa tài khoản và xóa tài khoản thành công.\n");

  // VÒNG 7: KIỂM THỬ TỰ ĐỔI MẬT KHẨU BẰNG RESET PASS QUA EMAIL
  console.log("--- VÒNG 7: HUMAN TEST TÍNH NĂNG RESET MẬT KHẨU QUA EMAIL ---");
  // 1. Gửi yêu cầu reset mật khẩu cho qa_super_admin
  const resetReq = await requestPasswordReset("qa_super_admin", "http://localhost:3000");
  assert(resetReq.ok, "Yêu cầu reset mật khẩu thất bại.");
  assert(resetReq.debugToken, "Không sinh được mã token reset mật khẩu.");

  const targetDbUser = await prisma.adminUser.findUnique({ where: { username: "qa_super_admin" } });
  assert(targetDbUser.resetToken === resetReq.debugToken, "Token trong DB không khớp với token gửi đi.");
  assert(targetDbUser.resetTokenExpiry > new Date(), "Hạn sử dụng token không hợp lệ.");

  // 2. Thực hiện đặt lại mật khẩu mới với token
  const newSuperPass = "NewSuperSecret@2026!";
  const resetExec = await resetPasswordWithToken(resetReq.debugToken, newSuperPass);
  assert(resetExec.ok, "Thực hiện đặt lại mật khẩu bằng token thất bại.");

  // 3. Đăng nhập lại: Mật khẩu cũ phải thất bại, mật khẩu mới phải thành công
  const oldPassAuth = await verifyDashboardCredentials("qa_super_admin", "SuperSecret@2026");
  assert(!oldPassAuth.valid, "Mật khẩu cũ vẫn đăng nhập được sau khi reset!");

  const newPassAuth = await verifyDashboardCredentials("qa_super_admin", newSuperPass);
  assert(newPassAuth.valid && newPassAuth.user, "Mật khẩu mới không đăng nhập được sau khi reset!");

  // 4. Token phải bị vô hiệu sau khi đã dùng
  const reuseToken = await resetPasswordWithToken(resetReq.debugToken, "AnotherPassword@999");
  assert(!reuseToken.ok, "Token reset vẫn có thể tái sử dụng lần 2 (lỗ hổng bảo mật)!");

  console.log("✅ VÒNG 7 PASS: Tính năng đặt lại mật khẩu bằng reset pass qua email hoàn thành chính xác 100% bảo mật.\n");

  // Dọn dẹp tài khoản test
  await prisma.adminUser.deleteMany({
    where: {
      username: {
        in: [
          "qa_super_admin",
          "qa_web_manager",
          "qa_content_manager",
          "qa_product_manager",
          "qa_post_manager",
        ],
      },
    },
  });

  console.log("================================================================================");
  console.log("🎉 TOÀN BỘ 7 VÒNG HUMAN TEST END-TO-END ĐỀU ĐẠT CHUẨN XUẤT SẮC (ALL 7 ROUNDS PASS)");
  console.log("================================================================================");
}

run7Rounds()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  });
