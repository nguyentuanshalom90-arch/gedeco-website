'use client';

import { FormEvent, useState } from 'react';
import { EnglishPage } from '../../components/english-pages';
import { InnerHero } from '../../components/inner-pages';

export default function EnglishContact() {
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    const form = event.currentTarget;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      form.reset();
      setNotice('Your request has been received. GEDECO will contact you soon.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to submit your request.');
    } finally {
      setBusy(false);
    }
  }

  return <EnglishPage active="Contact">
    <InnerHero eyebrow="CONTACT GEDECO" title="Let us hear from you" subtitle="Discuss products, sourcing and business cooperation" />
    <section className="contact-page"><div className="container contact-page-grid">
      <form className="contact-form" onSubmit={submit}>
        <p className="eyebrow gold-text">CONTACT REQUEST</p><h2>Tell us what you need</h2>
        <div className="form-two"><label>Name<input name="name" required /></label><label>Company<input name="company" /></label><label>Phone<input name="phone" required /></label><label>Email<input name="email" required type="email" /></label></div>
        <label>Product or cooperation interest<select name="productInterest" defaultValue=""><option value="" disabled>Select an option</option><option>Tea and tea products</option><option>Agricultural and food products</option><option>Export products</option><option>Business cooperation</option></select></label>
        <label>Message<textarea name="message" required rows={5} /></label>
        <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <label className="check-line"><input name="consent" required type="checkbox" /> I agree to the privacy policy.</label>
        <button className="button button-gold" disabled={busy} type="submit">{busy ? 'Sending...' : 'Send request'} <span>→</span></button>
        {notice && <p className="form-notice" role="status">{notice}</p>}
      </form>
      <div className="contact-location"><h2>GEDECO office</h2><p>60 Trung Kính, Cau Giay, Hanoi, Vietnam</p><p>Hotline: <a href="tel:0914943653">0914 94 3653</a><br />Email: <a href="mailto:info@gedeco.vn">info@gedeco.vn</a></p></div>
    </div></section>
  </EnglishPage>;
}
