'use client';

import { useEffect, useState } from 'react';

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 4.5 9 4l2 4-2 1.5a14 14 0 0 0 5.5 5.5L16 13l4 2-.5 2.5c-.2 1-1.2 1.7-2.2 1.5C10.3 17.8 6.2 13.7 5 6.7c-.2-1 .5-2 1.5-2.2Z" /></svg>;
}

function ArrowUpIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" /></svg>;
}

export function ContactActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 260);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <div className="bimiFloatingTools" aria-label="Liên hệ nhanh">
    <a className="bimiFloatingButton bimiFloatingContact bimiFloatingZalo" href="https://zalo.me/0914943653" target="_blank" rel="noopener noreferrer" aria-label="Chat qua Zalo" title="Chat qua Zalo"><img src="/assets/contact-icons/zalo-chat.png" alt="Zalo" /></a>
    <a className="bimiFloatingButton bimiFloatingContact bimiFloatingPhone" href="tel:0914943653" aria-label="Gọi hotline 0914 94 3653" title="Gọi 0914 94 3653"><PhoneIcon /></a>
    <button type="button" className={`bimiFloatingButton bimiFloatingTop${visible ? ' isVisible' : ''}`} aria-label="Lên đầu trang" title="Lên đầu trang" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUpIcon /></button>
  </div>;
}
