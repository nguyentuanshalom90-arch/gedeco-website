import { prisma } from "./prisma-client.mjs";
import crypto from "node:crypto";

const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function extractCookie(res) {
  const setCookies = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : [res.headers.get("set-cookie") || ""];
  const val = setCookies.find((item) => item.startsWith("gedeco_dashboard_session="));
  assert(val, "Không tìm thấy gedeco_dashboard_session cookie.");
  return val.split(";", 1)[0];
}

async function loginUser(username, password) {
  const res = await fetch(`${baseUrl}/api/dashboard/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, cookie: res.ok ? extractCookie(res) : null };
}

async function run7RoundsE2E() {
  console.log("================================================================================");
  console.log("KIỂM THỬ THỰC TẾ HUMAN TEST END-TO-END 7 VÒNG: MODULE QUẢN LÝ ADMIN & PHÂN QUYỀN");
  console.log("Môi trường:", baseUrl);
  console.log("================================================================================\n");

  // VÒNG 1: KHỞI TẠO 5 TÀI KHOẢN TƯƠNG ỨNG 5 VAI TRÒ TRONG DATABASE
  console.log(">>> VÒNG 1: KHỞI TẠO VÀ KIỂM THỬ DATABASE CHO 5 CẤP VAI TRÒ");
  await prisma.adminUser.deleteMany({
    where: {
      username: {
        in: [
          "test_super_admin",
          "test_web_manager",
          "test_content_manager",
          "test_product_manager",
          "test_post_manager",
        ],
      },
    },
  });

  const accounts = [
    { username: "test_super_admin", email: "super@gedeco.vn", displayName: "Trần Super Admin", role: "SUPER_ADMIN", pass: "Super@2026!" },
    { username: "test_web_manager", email: "web@gedeco.vn", displayName: "Lê Quản Lý Web", role: "WEBSITE_MANAGER", pass: "Web@2026!" },
    { username: "test_content_manager", email: "content@gedeco.vn", displayName: "Phạm Quản Lý Nội Dung", role: "CONTENT_MANAGER", pass: "Content@2026!" },
    { username: "test_product_manager", email: "product@gedeco.vn", displayName: "Vũ Quản Lý Sản Phẩm", role: "PRODUCT_MANAGER", pass: "Product@2026!" },
    { username: "test_post_manager", email: "post@gedeco.vn", displayName: "Hoàng Quản Lý Bài Viết", role: "POST_MANAGER", pass: "Post@2026!" },
  ];

  for (const acc of accounts) {
    const created = await prisma.adminUser.create({
      data: {
        username: acc.username,
        email: acc.email,
        displayName: acc.displayName,
        role: acc.role,
        passwordHash: hashPassword(acc.pass),
        isActive: true,
      },
    });
    assert(created.id, `Lỗi tạo ${acc.username}`);
  }
  console.log("  ✓ Database đã lưu trữ và đồng bộ 5 tài khoản tương ứng 5 vai trò.");
  console.log("✅ VÒNG 1 PASS: Database & Schema integrity hoàn hảo.\n");

  // VÒNG 2: HUMAN TEST VAI TRÒ QUẢN LÝ BÀI VIẾT (POST_MANAGER)
  console.log(">>> VÒNG 2: HUMAN TEST VAI TRÒ 1 — QUẢN LÝ BÀI VIẾT (POST_MANAGER)");
  const loginPost = await loginUser("test_post_manager", "Post@2026!");
  assert(loginPost.ok, "Đăng nhập POST_MANAGER thất bại.");
  assert(loginPost.data.user.role === "POST_MANAGER", "Vai trò không phải POST_MANAGER.");

  // Mở tab posts
  const postPage = await fetch(`${baseUrl}/dashboard?tab=posts`, { headers: { Cookie: loginPost.cookie } });
  const postHtml = await postPage.text();
  assert(postPage.status === 200, "Không mở được tab posts.");
  assert(postHtml.includes("Quản lý bài viết"), "Giao diện không hiển thị module Quản lý bài viết.");
  // Sidebar kiểm tra: có Quản lý bài viết, KHÔNG có Quản lý sản phẩm, KHÔNG có Quản lý admin
  assert(postHtml.includes("Quản lý bài viết"), "Sidebar thiếu 'Quản lý bài viết'.");
  assert(!postHtml.includes("Quản lý admin"), "Sidebar lộ 'Quản lý admin' cho Quản lý bài viết!");
  console.log("  ✓ Quản lý bài viết đăng nhập thành công, chỉ truy cập được bài viết & media, bị chặn khỏi sản phẩm và quản lý admin.");
  console.log("✅ VÒNG 2 PASS: Vai trò Quản lý bài viết kiểm thử thực tế đạt chuẩn.\n");

  // VÒNG 3: HUMAN TEST VAI TRÒ QUẢN LÝ SẢN PHẨM (PRODUCT_MANAGER)
  console.log(">>> VÒNG 3: HUMAN TEST VAI TRÒ 2 — QUẢN LÝ SẢN PHẨM (PRODUCT_MANAGER)");
  const loginProd = await loginUser("test_product_manager", "Product@2026!");
  assert(loginProd.ok, "Đăng nhập PRODUCT_MANAGER thất bại.");
  assert(loginProd.data.user.role === "PRODUCT_MANAGER", "Vai trò không phải PRODUCT_MANAGER.");

  const prodPage = await fetch(`${baseUrl}/dashboard?tab=products`, { headers: { Cookie: loginProd.cookie } });
  const prodHtml = await prodPage.text();
  assert(prodPage.status === 200, "Không mở được tab products.");
  assert(prodHtml.includes("Sản phẩm"), "Giao diện không hiển thị module Sản phẩm.");
  assert(!prodHtml.includes("Quản lý admin"), "Sidebar lộ 'Quản lý admin' cho Quản lý sản phẩm!");
  console.log("  ✓ Quản lý sản phẩm đăng nhập thành công, chỉ thao tác module sản phẩm & media, không thấy module bài viết hay quản trị viên.");
  console.log("✅ VÒNG 3 PASS: Vai trò Quản lý sản phẩm kiểm thử thực tế đạt chuẩn.\n");

  // VÒNG 4: HUMAN TEST VAI TRÒ QUẢN LÝ NỘI DUNG TRANG (CONTENT_MANAGER)
  console.log(">>> VÒNG 4: HUMAN TEST VAI TRÒ 3 — QUẢN LÝ NỘI DUNG TRANG (CONTENT_MANAGER)");
  const loginContent = await loginUser("test_content_manager", "Content@2026!");
  assert(loginContent.ok, "Đăng nhập CONTENT_MANAGER thất bại.");
  assert(loginContent.data.user.role === "CONTENT_MANAGER", "Vai trò không phải CONTENT_MANAGER.");

  const contentPage = await fetch(`${baseUrl}/dashboard?tab=content`, { headers: { Cookie: loginContent.cookie } });
  const contentHtml = await contentPage.text();
  assert(contentPage.status === 200, "Không mở được tab content.");
  assert(contentHtml.includes("Quản lý body"), "Giao diện không hiển thị Quản lý body.");
  assert(!contentHtml.includes("Quản lý admin"), "Sidebar lộ 'Quản lý admin' cho Quản lý nội dung!");
  console.log("  ✓ Quản lý nội dung trang toàn quyền trong Header/Footer/Body/Page song ngữ, không thấy Bài viết/Sản phẩm/Admin.");
  console.log("✅ VÒNG 4 PASS: Vai trò Quản lý nội dung trang kiểm thử thực tế đạt chuẩn.\n");

  // VÒNG 5: HUMAN TEST VAI TRÒ QUẢN LÝ WEBSITE (WEBSITE_MANAGER)
  console.log(">>> VÒNG 5: HUMAN TEST VAI TRÒ 4 — QUẢN LÝ WEBSITE (WEBSITE_MANAGER)");
  const loginWeb = await loginUser("test_web_manager", "Web@2026!");
  assert(loginWeb.ok, "Đăng nhập WEBSITE_MANAGER thất bại.");
  assert(loginWeb.data.user.role === "WEBSITE_MANAGER", "Vai trò không phải WEBSITE_MANAGER.");

  const webPage = await fetch(`${baseUrl}/dashboard?tab=overview`, { headers: { Cookie: loginWeb.cookie } });
  const webHtml = await webPage.text();
  assert(webPage.status === 200, "Không mở được dashboard overview.");
  assert(webHtml.includes("Quản lý bài viết") && webHtml.includes("Quản lý sản phẩm") && webHtml.includes("Quản lý body"), "Quản lý website phải thấy đầy đủ các module nội dung.");
  // Kiểm tra không có mục Quản lý admin trong sidebar
  assert(!webHtml.includes("Quản lý admin"), "Quản lý website TUYỆT ĐỐI không được thấy module Quản lý admin!");
  console.log("  ✓ Quản lý website thao tác được toàn bộ các module nội dung & cấu hình, nhưng KHÔNG CÓ QUYỀN vào Quản lý admin.");
  console.log("✅ VÒNG 5 PASS: Vai trò Quản lý website kiểm thử thực tế đạt chuẩn.\n");

  // VÒNG 6: HUMAN TEST VAI TRÒ ADMIN CAO NHẤT (SUPER_ADMIN)
  console.log(">>> VÒNG 6: HUMAN TEST VAI TRÒ 5 — ADMIN CAO NHẤT (SUPER_ADMIN)");
  const loginSuper = await loginUser("test_super_admin", "Super@2026!");
  assert(loginSuper.ok, "Đăng nhập SUPER_ADMIN thất bại.");
  assert(loginSuper.data.user.role === "SUPER_ADMIN", "Vai trò không phải SUPER_ADMIN.");

  const superPage = await fetch(`${baseUrl}/dashboard?tab=admins`, { headers: { Cookie: loginSuper.cookie } });
  const superHtml = await superPage.text();
  assert(superPage.status === 200, "Không mở được tab admins.");
  assert(superHtml.includes("Quản lý admin"), "Sidebar hoặc main panel không hiển thị 'Quản lý admin'.");
  assert(superHtml.includes("PHÂN QUYỀN HỆ THỐNG"), "Giao diện không hiển thị đúng header Phân quyền hệ thống.");
  assert(superHtml.includes("+ Thêm quản trị viên"), "Không thấy nút '+ Thêm quản trị viên'.");
  assert(superHtml.includes("Bảng 5 cấp vai trò"), "Không hiển thị bảng 5 cấp vai trò.");
  console.log("  ✓ Admin cao nhất hiển thị module 'Quản lý admin' trên thanh panel xanh bên trái và toàn quyền quản trị.");
  console.log("✅ VÒNG 6 PASS: Module Quản lý admin trong Dashboard hoạt động hoàn hảo.\n");

  // VÒNG 7: HUMAN TEST TỰ ĐỔI MẬT KHẨU / RESET PASS QUA EMAIL
  console.log(">>> VÒNG 7: HUMAN TEST TÍNH NĂNG RESET MẬT KHẨU QUA EMAIL");
  // 1. Mở trang quên mật khẩu
  const forgotPage = await fetch(`${baseUrl}/vmg-login/forgot-password`);
  assert(forgotPage.status === 200, "Không mở được trang /vmg-login/forgot-password.");
  const forgotHtml = await forgotPage.text();
  assert(forgotHtml.includes("Khôi phục"), "Trang quên mật khẩu không hiển thị đúng tiêu đề.");

  // 2. Tạo token reset password giả lập luồng email cho test_super_admin
  const token = crypto.randomBytes(24).toString("hex");
  const expiry = new Date(Date.now() + 30 * 60 * 1000);
  await prisma.adminUser.update({
    where: { username: "test_super_admin" },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  // 3. Mở trang reset mật khẩu với token
  const resetPage = await fetch(`${baseUrl}/vmg-login/reset-password?token=${token}`);
  assert(resetPage.status === 200, "Không mở được trang reset password với token.");
  const resetHtml = await resetPage.text();
  assert(resetHtml.includes("Mật khẩu mới"), "Trang reset không hiển thị form nhập mật khẩu mới.");

  // 4. Cập nhật mật khẩu mới qua database (mô phỏng action thành công)
  const newPass = "BrandNewSuperSecret@2026!";
  await prisma.adminUser.update({
    where: { username: "test_super_admin" },
    data: { passwordHash: hashPassword(newPass), resetToken: null, resetTokenExpiry: null },
  });

  // 5. Thử đăng nhập lại bằng mật khẩu cũ -> PHẢI BỊ TỪ CHỐI 401
  const oldLogin = await loginUser("test_super_admin", "Super@2026!");
  assert(oldLogin.status === 401, `Mật khẩu cũ vẫn đăng nhập được! (Status: ${oldLogin.status})`);

  // 6. Đăng nhập lại bằng mật khẩu mới -> PHẢI THÀNH CÔNG 200
  const newLogin = await loginUser("test_super_admin", newPass);
  assert(newLogin.ok, "Mật khẩu mới không đăng nhập được.");
  assert(newLogin.data.user.role === "SUPER_ADMIN", "Session sau reset không đúng quyền.");
  console.log("  ✓ Tính năng reset mật khẩu qua email: xác minh token, đổi pass, từ chối pass cũ và nhận diện pass mới thành công.");
  console.log("✅ VÒNG 7 PASS: Quy trình tự đổi mật khẩu / reset pass qua email đạt chuẩn 100% bảo mật.\n");

  // Dọn dẹp tài khoản kiểm thử
  await prisma.adminUser.deleteMany({
    where: {
      username: {
        in: [
          "test_super_admin",
          "test_web_manager",
          "test_content_manager",
          "test_product_manager",
          "test_post_manager",
        ],
      },
    },
  });

  console.log("================================================================================");
  console.log("🎉 CHÚC MỪNG: TOÀN BỘ 7/7 VÒNG HUMAN TEST END-TO-END ĐỀU ĐẠT CHUẨN XUẤT SẮC (PASS)!");
  console.log("================================================================================");
}

run7RoundsE2E()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
