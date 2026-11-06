import type { Metadata } from 'next';
import { CTA, Icon, InnerHero, InnerPage } from '../components/inner-pages';
import { ContactForm } from '../components/contact-form';
import { getPublicSiteContent } from '@/lib/site-content-public';

export const metadata: Metadata = { title: 'Liên hệ', description: 'Liên hệ GEDECO để được tư vấn nguồn hàng, sản phẩm, xuất khẩu và cơ hội hợp tác thương mại.', alternates: { canonical: '/lien-he' } };

const contactCards = [
  ['phone', 'Hotline tư vấn', '0914 94 3653', 'Hỗ trợ nhanh chóng, tư vấn giải pháp phù hợp cho doanh nghiệp.'],
  ['mail', 'Email liên hệ', 'info@gedeco.vn', 'Tiếp nhận yêu cầu, báo giá và hợp tác kinh doanh.'],
  ['pin', 'Văn phòng giao dịch', 'Số 60 Trung Kính', 'P. Trung Hòa, Q. Cầu Giấy, TP. Hà Nội.'],
];

export default async function ContactPage() {
  const content = await getPublicSiteContent('lien-he');
  return <InnerPage active="Liên hệ" pageClass="contact-design">
    <InnerHero eyebrow="LIÊN HỆ VỚI GEDECO" title={content.values['hero.title'] || 'Liên hệ với GEDECO'} subtitle={content.values['hero.subtitle'] || 'Kết nối – Tư vấn – Hợp tác'} />
    <section className="contact-intro"><div className="container inner-split"><div className="inner-image"><img src="/assets/banner-2.jpg" alt="Sản phẩm và hoạt động thương mại của GEDECO" /></div><div><p className="eyebrow gold-text">VỀ GEDECO</p><h2>Cùng phát triển sản phẩm và cơ hội hợp tác</h2><p>GEDECO kết nối nguồn hàng Việt Nam với khách hàng, đối tác trong nước và quốc tế. Hãy liên hệ để trao đổi nhu cầu sản phẩm, hợp tác hoặc phân phối.</p></div></div></section>
    <section className="contact-card-band"><div className="container contact-card-grid">{contactCards.map(([icon,title,value,copy])=><article key={title}><Icon name={icon as any}/><div><h3>{title}</h3><b>{value}</b><p>{copy}</p></div></article>)}</div></section>
    <section className="contact-page"><div className="container contact-page-grid">
      <ContactForm />
      <div className="contact-location"><h2>Địa điểm & bản đồ văn phòng</h2><div className="contact-map"><img src="/assets/banner-2.jpg" alt="Bản đồ văn phòng GEDECO" /><span><Icon name="pin" /> GEDECO</span></div><div className="contact-info-list"><div><Icon name="pin"/><span><b>Văn phòng chính GEDECO</b><span>Số 60 Trung Kính, P. Trung Hòa, Q. Cầu Giấy, TP. Hà Nội</span></span></div><div><Icon name="chart"/><span><b>Giờ làm việc</b><span>Thứ Hai – Thứ Sáu: 08:00 – 17:30<br/>Thứ Bảy: 08:00 – 12:00</span></span></div></div></div>
    </div></section>
    <section className="quick-contact"><div className="container"><h2>LIÊN HỆ NHANH VỚI CHÚNG TÔI</h2><div className="quick-contact-grid"><a href="tel:0914943653"><Icon name="phone"/><span><b>Gọi Hotline</b>0914 94 3653</span><Icon name="arrow"/></a><a href="https://zalo.me/0914943653" target="_blank" rel="noopener noreferrer"><span className="chat-badge zalo">Zalo</span><span><b>Chat qua Zalo</b>Tư vấn nhanh, tiện lợi</span><Icon name="arrow"/></a><a href="https://www.facebook.com/www.gedeco.tra.thuong.hang" target="_blank" rel="noopener noreferrer"><span className="chat-badge messenger">M</span><span><b>Nhắn Messenger</b>Hỗ trợ & giải đáp trực tiếp</span><Icon name="arrow"/></a></div></div></section>
    <section className="faq-section"><div className="container faq-layout"><div><p className="eyebrow">HỖ TRỢ KHÁCH HÀNG</p><h2>Các câu hỏi thường gặp khi liên hệ GEDECO</h2></div><div className="faq-grid">{['GEDECO hỗ trợ những nhu cầu nào?','Tôi có thể nhận báo giá trong bao lâu?','GEDECO có làm việc với doanh nghiệp ở ngoài Hà Nội không?','Làm thế nào để trở thành đối tác của GEDECO?'].map(q => <details key={q}><summary>{q}<Icon name="chevron" /></summary><p>Đội ngũ GEDECO sẽ tiếp nhận thông tin và phản hồi theo nhu cầu cụ thể của doanh nghiệp.</p></details>)}</div></div></section>
    <CTA title="Bắt đầu hợp tác cùng GEDECO ngay hôm nay" />
  </InnerPage>;
}
