import { prisma } from '@/lib/prisma';

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
    if (name.length < 2 || !email.includes('@') || phone.length < 8 || message.length < 5 || input.consent !== 'on') {
      return Response.json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' }, { status: 400 });
    }
    const context = [company ? `Doanh nghiệp: ${company}` : '', productInterest ? `Sản phẩm quan tâm: ${productInterest}` : ''].filter(Boolean).join('\n');
    const storedMessage = context ? `${context}\n${message}` : message;
    await prisma.contactRequest.create({ data: { name, email, phone, message: storedMessage } });
    let emailDelivered = false;
    if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.MAIL_FROM, to: ['info@gedeco.vn'], subject: `Yêu cầu liên hệ mới từ ${name}`, text: `Họ tên: ${name}\nEmail: ${email}\nĐiện thoại: ${phone}\n\n${storedMessage}` }),
      });
      emailDelivered = emailResponse.ok;
    }
    return Response.json({ ok: true, emailDelivered });
  } catch {
    return Response.json({ error: 'Không thể tiếp nhận yêu cầu lúc này.' }, { status: 500 });
  }
}
