import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

function getSmtpTransport() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user, pass },
  });
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as Record<string, unknown>;
    const name = String(input.name || '').trim();
    const email = String(input.email || '').trim();
    const phone = String(input.phone || '').trim();
    const company = String(input.company || '').trim();
    const productInterest = String(input.productInterest || '').trim();
    const message = String(input.message || '').trim();
    const website = String(input.website || '').trim();
    if (website) return Response.json({ ok: true, emailDelivered: false });
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 8 || input.consent !== 'on') {
      return Response.json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' }, { status: 400 });
    }
    const context = [company ? `Doanh nghiệp: ${company}` : '', productInterest ? `Sản phẩm quan tâm: ${productInterest}` : ''].filter(Boolean).join('\n');
    const storedMessage = context ? `${context}\n${message}` : message;
    await prisma.contactRequest.create({ data: { name, email, phone, message: storedMessage } });
    let emailDelivered = false;
    const smtp = getSmtpTransport();
    const receiver = process.env.CONTACT_EMAIL?.trim() || process.env.SMTP_USER?.trim();
    if (!smtp || !receiver) {
      return Response.json({ error: 'Hệ thống email chưa được cấu hình, vui lòng thử lại sau.' }, { status: 503 });
    }
    const subject = `Yêu cầu liên hệ mới từ ${name}`;
    const leadText = `Họ tên: ${name}\nEmail: ${email}\nĐiện thoại: ${phone}\n\n${storedMessage}`;
    await smtp.sendMail({
      from: process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim(),
      to: receiver,
      replyTo: email,
      subject,
      text: leadText,
    });
    await smtp.sendMail({
      from: process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim(),
      to: email,
      subject: 'GEDECO đã nhận được yêu cầu liên hệ của bạn',
      text: `Kính gửi ${name},\n\nGEDECO đã nhận được thông tin liên hệ của quý khách. Cảm ơn quý khách đã quan tâm và gửi yêu cầu cho chúng tôi. Đội ngũ GEDECO sẽ xem xét nội dung và liên hệ lại trong thời gian sớm nhất.\n\nTrân trọng,\nGEDECO\nHotline: 0914 94 3653\nEmail: ${receiver}`,
    });
    emailDelivered = true;
    return Response.json({ ok: true, emailDelivered });
  } catch {
    return Response.json({ error: 'Không thể tiếp nhận yêu cầu lúc này.' }, { status: 500 });
  }
}
