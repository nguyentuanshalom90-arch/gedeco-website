'use client';

import { FormEvent, useState } from 'react';

const viCopy = { eyebrow: 'GỬI YÊU CẦU LIÊN HỆ', title: 'Để lại thông tin, chúng tôi sẽ liên hệ sớm nhất', name: 'Họ và tên', namePlaceholder: 'Họ và tên', company: 'Doanh nghiệp', companyPlaceholder: 'Tên doanh nghiệp', phone: 'Số điện thoại', phonePlaceholder: 'Số điện thoại', email: 'Email', interest: 'Sản phẩm quan tâm', select: 'Chọn sản phẩm hoặc nhu cầu', tea: 'Trà và sản phẩm từ trà', agriculture: 'Nông sản và thực phẩm', export: 'Sản phẩm xuất khẩu khác', business: 'Hợp tác thương mại', message: 'Nội dung chi tiết', messagePlaceholder: 'Nhu cầu, yêu cầu báo giá...', consent: 'Tôi đồng ý với Chính sách bảo mật thông tin.', send: 'Gửi yêu cầu liên hệ', sending: 'Đang gửi...', success: 'Yêu cầu đã được ghi nhận thành công. GEDECO sẽ liên hệ lại quý khách sớm nhất.', close: 'Đóng thông báo', successTitle: 'Gửi thành công', errorTitle: 'Vui lòng kiểm tra lại' };
const enCopy: typeof viCopy = { eyebrow: 'CONTACT REQUEST', title: 'Tell us what you need', name: 'Name', namePlaceholder: 'Your name', company: 'Company', companyPlaceholder: 'Company name', phone: 'Phone', phonePlaceholder: 'Phone number', email: 'Email', interest: 'Product or cooperation interest', select: 'Select a product or need', tea: 'Tea and tea products', agriculture: 'Agricultural and food products', export: 'Other export products', business: 'Business cooperation', message: 'Message', messagePlaceholder: 'Your needs or quotation request...', consent: 'I agree to the privacy policy.', send: 'Send request', sending: 'Sending...', success: 'Your request has been received. GEDECO will contact you soon.', close: 'Close notification', successTitle: 'Sent successfully', errorTitle: 'Please check the form' };
export type ContactFormCopy = typeof viCopy;

export function ContactForm({ english = false, labels }: { english?: boolean; labels?: Partial<ContactFormCopy> }) {
  const copy = { ...(english ? enCopy : viCopy), ...labels };
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const missing = [
      !String(payload.name || '').trim() && (english ? 'name' : 'họ và tên'),
      !String(payload.phone || '').trim() && (english ? 'phone number' : 'số điện thoại'),
      !String(payload.email || '').trim() && (english ? 'email' : 'email'),
      payload.consent !== 'on' && (english ? 'privacy policy consent' : 'đồng ý chính sách bảo mật'),
    ].filter(Boolean);
    if (missing.length) {
      setNotice({ type: 'error', message: english ? `Please complete: ${missing.join(', ')}.` : `Vui lòng điền đủ: ${missing.join(', ')}.` });
      setBusy(false);
      return;
    }
    const email = String(payload.email || '').trim();
    const phone = String(payload.phone || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice({ type: 'error', message: english ? 'Please enter a valid email address.' : 'Vui lòng nhập đúng địa chỉ email.' });
      setBusy(false);
      return;
    }
    if (phone.replace(/\D/g, '').length < 8) {
      setNotice({ type: 'error', message: english ? 'Please enter a valid phone number.' : 'Vui lòng nhập đúng số điện thoại.' });
      setBusy(false);
      return;
    }
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok || !result.ok || result.emailDelivered === false) throw new Error(result.error || (english ? 'Unable to send your request by email.' : 'Chưa thể gửi email yêu cầu, vui lòng thử lại sau.'));
      form.reset();
      setNotice({ type: 'success', message: copy.success });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : (english ? 'Unable to submit your request.' : 'Không thể gửi yêu cầu.') });
    } finally {
      setBusy(false);
    }
  }
  return <form className="contact-form" noValidate onSubmit={submit}>
    <p className="eyebrow gold-text">{copy.eyebrow}</p><h2>{copy.title}</h2>
    <div className="form-two"><label><span>{copy.name} <b className="required-mark" aria-hidden="true">*</b></span><input name="name" required type="text" placeholder={copy.namePlaceholder} /></label><label><span>{copy.company}</span><input name="company" type="text" placeholder={copy.companyPlaceholder} /></label><label><span>{copy.phone} <b className="required-mark" aria-hidden="true">*</b></span><input name="phone" required type="tel" placeholder={copy.phonePlaceholder} /></label><label><span>{copy.email} <b className="required-mark" aria-hidden="true">*</b></span><input name="email" required type="email" placeholder={copy.email} /></label></div>
    <label>{copy.interest}<select name="productInterest" defaultValue=""><option value="" disabled>{copy.select}</option><option>{copy.tea}</option><option>{copy.agriculture}</option><option>{copy.export}</option><option>{copy.business}</option></select></label>
    <label>{copy.message}<textarea name="message" placeholder={copy.messagePlaceholder} rows={4} /></label>
    <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="check-line"><input name="consent" required type="checkbox" /> <span>{copy.consent} <b className="required-mark" aria-hidden="true">*</b></span></label>
    <button className="button button-gold" disabled={busy} type="submit">{busy ? copy.sending : copy.send} <span>→</span></button>
    {notice && <div className={`form-popup ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}><button type="button" aria-label={copy.close} onClick={() => setNotice(null)}>×</button><strong>{notice.type === 'success' ? copy.successTitle : copy.errorTitle}</strong><span>{notice.message}</span></div>}
  </form>;
}
