'use client';

import { FormEvent, useState } from 'react';

export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Không thể gửi yêu cầu.');
      form.reset();
      setNotice('Yêu cầu đã được ghi nhận. GEDECO sẽ liên hệ lại sớm nhất.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể gửi yêu cầu.');
    } finally {
      setBusy(false);
    }
  }
  return <form className="contact-form" onSubmit={submit}>
    <p className="eyebrow gold-text">GỬI YÊU CẦU LIÊN HỆ</p><h2>Để lại thông tin, chúng tôi sẽ liên hệ sớm nhất</h2>
    <div className="form-two"><label>Họ và tên<input name="name" required type="text" placeholder="Họ và tên" /></label><label>Doanh nghiệp<input name="company" type="text" placeholder="Tên doanh nghiệp" /></label><label>Số điện thoại<input name="phone" required type="tel" placeholder="Số điện thoại" /></label><label>Email<input name="email" required type="email" placeholder="Email" /></label></div>
    <label>Sản phẩm quan tâm<select name="productInterest" defaultValue=""><option value="" disabled>Chọn sản phẩm hoặc nhu cầu</option><option>Trà và sản phẩm từ trà</option><option>Nông sản và thực phẩm</option><option>Sản phẩm xuất khẩu khác</option><option>Hợp tác thương mại</option></select></label>
    <label>Nội dung chi tiết<textarea name="message" required placeholder="Nhu cầu, yêu cầu báo giá..." rows={4} /></label>
    <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="check-line"><input name="consent" required type="checkbox" /> Tôi đồng ý với Chính sách bảo mật thông tin.</label>
    <button className="button button-gold" disabled={busy} type="submit">{busy ? 'Đang gửi...' : 'Gửi yêu cầu liên hệ'} <span>→</span></button>
    {notice && <p className="form-notice" role="status">{notice}</p>}
  </form>;
}
