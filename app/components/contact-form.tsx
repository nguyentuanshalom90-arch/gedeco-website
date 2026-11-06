'use client';

import { FormEvent, useState } from 'react';

export function ContactForm({ english = false }: { english?: boolean }) {
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
      if (!response.ok) throw new Error(result.error || (english ? 'Unable to submit your request.' : 'Không thể gửi yêu cầu.'));
      form.reset();
      setNotice(english ? 'Your request has been received. GEDECO will contact you soon.' : 'Yêu cầu đã được ghi nhận. GEDECO sẽ liên hệ lại sớm nhất.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : (english ? 'Unable to submit your request.' : 'Không thể gửi yêu cầu.'));
    } finally {
      setBusy(false);
    }
  }
  const copy = english ? { eyebrow: 'CONTACT REQUEST', title: 'Tell us what you need', name: 'Name', namePlaceholder: 'Your name', company: 'Company', companyPlaceholder: 'Company name', phone: 'Phone', phonePlaceholder: 'Phone number', email: 'Email', interest: 'Product or cooperation interest', select: 'Select a product or need', tea: 'Tea and tea products', agriculture: 'Agricultural and food products', export: 'Other export products', business: 'Business cooperation', message: 'Message', messagePlaceholder: 'Your needs or quotation request...', consent: 'I agree to the privacy policy.', send: 'Send request', sending: 'Sending...' } : { eyebrow: 'GỬI YÊU CẦU LIÊN HỆ', title: 'Để lại thông tin, chúng tôi sẽ liên hệ sớm nhất', name: 'Họ và tên', namePlaceholder: 'Họ và tên', company: 'Doanh nghiệp', companyPlaceholder: 'Tên doanh nghiệp', phone: 'Số điện thoại', phonePlaceholder: 'Số điện thoại', email: 'Email', interest: 'Sản phẩm quan tâm', select: 'Chọn sản phẩm hoặc nhu cầu', tea: 'Trà và sản phẩm từ trà', agriculture: 'Nông sản và thực phẩm', export: 'Sản phẩm xuất khẩu khác', business: 'Hợp tác thương mại', message: 'Nội dung chi tiết', messagePlaceholder: 'Nhu cầu, yêu cầu báo giá...', consent: 'Tôi đồng ý với Chính sách bảo mật thông tin.', send: 'Gửi yêu cầu liên hệ', sending: 'Đang gửi...' };
  return <form className="contact-form" onSubmit={submit}>
    <p className="eyebrow gold-text">{copy.eyebrow}</p><h2>{copy.title}</h2>
    <div className="form-two"><label>{copy.name}<input name="name" required type="text" placeholder={copy.namePlaceholder} /></label><label>{copy.company}<input name="company" type="text" placeholder={copy.companyPlaceholder} /></label><label>{copy.phone}<input name="phone" required type="tel" placeholder={copy.phonePlaceholder} /></label><label>{copy.email}<input name="email" required type="email" placeholder={copy.email} /></label></div>
    <label>{copy.interest}<select name="productInterest" defaultValue=""><option value="" disabled>{copy.select}</option><option>{copy.tea}</option><option>{copy.agriculture}</option><option>{copy.export}</option><option>{copy.business}</option></select></label>
    <label>{copy.message}<textarea name="message" required placeholder={copy.messagePlaceholder} rows={4} /></label>
    <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="check-line"><input name="consent" required type="checkbox" /> {copy.consent}</label>
    <button className="button button-gold" disabled={busy} type="submit">{busy ? copy.sending : copy.send} <span>→</span></button>
    {notice && <p className="form-notice" role="status">{notice}</p>}
  </form>;
}
