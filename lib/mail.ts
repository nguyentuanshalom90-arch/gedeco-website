import nodemailer from "nodemailer";

export function getSmtpTransport() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail({
  to,
  displayName,
  resetUrl,
  resetToken,
}: {
  to: string;
  displayName: string;
  resetUrl: string;
  resetToken: string;
}): Promise<{ ok: boolean; error?: string }> {
  const smtp = getSmtpTransport();
  const sender = process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim();

  const subject = "[GEDECO] Yêu cầu đặt lại mật khẩu quản trị viên";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0a2540; margin: 0 0 8px;">TRUNG TÂM QUẢN TRỊ GEDECO</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Yêu cầu đặt lại mật khẩu cho tài khoản quản trị</p>
      </div>
      <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Xin chào <strong>${displayName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên website GEDECO.
        Nếu bạn là người gửi yêu cầu này, vui lòng nhấn vào nút bên dưới để tiến hành thiết lập mật khẩu mới:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
          Đặt lại mật khẩu
        </a>
      </div>
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
        <p style="color: #475569; font-size: 13px; margin: 0 0 4px;">Hoặc dán liên kết sau vào trình duyệt của bạn:</p>
        <p style="color: #2563eb; font-size: 12px; word-break: break-all; margin: 0;">${resetUrl}</p>
        <p style="color: #64748b; font-size: 12px; margin: 8px 0 0;">Mã xác nhận: <strong style="font-family: monospace; font-size: 14px; color: #0f172a;">${resetToken}</strong></p>
      </div>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
        Liên kết này có hiệu lực trong vòng <strong>30 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, xin hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
        GEDECO · Hệ thống quản trị nội dung an toàn
      </p>
    </div>
  `;

  if (!smtp || !sender) {
    // If SMTP is not configured in local environment, log the reset URL and token
    console.warn(`[DEV RESET EMAIL] SMTP not configured. Reset link for ${to}: ${resetUrl} (Token: ${resetToken})`);
    return { ok: true };
  }

  try {
    await smtp.sendMail({
      from: sender,
      to,
      subject,
      html,
      text: `Xin chào ${displayName},\n\nVui lòng truy cập liên kết sau để đặt lại mật khẩu: ${resetUrl}\nMã token: ${resetToken}\nLiên kết có hiệu lực trong 30 phút.`,
    });
    return { ok: true };
  } catch (error) {
    console.error("[SMTP ERROR] Không thể gửi email:", error);
    // Still log link for development / fallback recovery
    console.warn(`[FALLBACK RESET EMAIL] Reset link for ${to}: ${resetUrl} (Token: ${resetToken})`);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi gửi email qua SMTP" };
  }
}
