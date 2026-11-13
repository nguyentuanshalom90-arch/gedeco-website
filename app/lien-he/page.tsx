import type { Metadata } from 'next';
import { CTA, Icon, InnerHero, InnerPage } from '../components/inner-pages';
import { ContactForm } from '../components/contact-form';
import { getPublicSiteContent } from '@/lib/site-content-public';

export const metadata: Metadata = { title: 'Liên hệ', description: 'Liên hệ GEDECO để được tư vấn nguồn hàng, sản phẩm, xuất khẩu và cơ hội hợp tác thương mại.', alternates: { canonical: '/lien-he' } };

const contactCards = [
  ['phone', 'Hotline tư vấn', '0914 94 3653', 'Hỗ trợ nhanh chóng, tư vấn giải pháp phù hợp cho doanh nghiệp.'],
  ['mail', 'Email liên hệ', 'info@gedeco.vn', 'Tiếp nhận yêu cầu, báo giá và hợp tác kinh doanh.'],
  ['pin', 'Trụ sở GEDECO', 'Tầng 14, số 169 Nguyễn Ngọc Vũ', 'P. Yên Hòa, TP. Hà Nội, Việt Nam.'],
] as const;

export default async function ContactPage({ language = 'vi' }: { language?: 'vi' | 'en' } = {}) {
  const english = language === 'en';
  const content = await getPublicSiteContent('lien-he');
  const copy = english ? {
    active: 'Contact', eyebrow: 'CONTACT GEDECO', title: 'Contact GEDECO', subtitle: 'Connect – Consult – Cooperate', imageAlt: 'GEDECO products and trade activities', intro: 'Please contact us to discuss product, cooperation or distribution needs.',
    cards: [['phone', 'Advisory hotline', '0914 94 3653', 'Fast support and suitable solutions for businesses.'], ['mail', 'Contact email', 'info@gedeco.vn', 'Receiving enquiries, quotations and business cooperation.'], ['pin', 'GEDECO head office', '14th Floor, 169 Nguyen Ngoc Vu', 'Yen Hoa Ward, Hanoi, Vietnam.']] as const,
    locationTitle: 'Office location & map', locationAlt: 'GEDECO office map', office: 'GEDECO head office', address: '14th Floor, Multifunctional Building, 169 Nguyen Ngoc Vu, Yen Hoa Ward, Hanoi, Vietnam', hours: 'Working hours', schedule: <>Monday – Friday: 08:00 – 17:30<br />Saturday: 08:00 – 12:00</>, quickTitle: 'CONTACT US QUICKLY', call: 'Call the hotline', zalo: 'Chat on Zalo', zaloCopy: 'Fast and convenient advice', messenger: 'Message on Messenger', messengerCopy: 'Direct support and answers', faqEyebrow: 'CUSTOMER SUPPORT', faqTitle: 'Frequently asked questions when contacting GEDECO', faqQuestions: ['What needs can GEDECO support?', 'How quickly can I receive a quotation?', 'Does GEDECO work with businesses outside Hanoi?', 'How can I become a GEDECO partner?'], faqAnswer: 'The GEDECO team will receive your information and respond to the specific needs of your business.', ctaTitle: 'Start a partnership with GEDECO today', ctaText: 'Share your needs and let us propose a suitable solution.'
  } : {
    active: 'Liên hệ', eyebrow: 'LIÊN HỆ VỚI GEDECO', title: content.values['hero.title'] || 'Liên hệ với GEDECO', subtitle: content.values['hero.subtitle'] || 'Kết nối – Tư vấn – Hợp tác', imageAlt: 'Sản phẩm và hoạt động thương mại của GEDECO', intro: 'Hãy liên hệ để trao đổi nhu cầu sản phẩm, hợp tác hoặc phân phối.',
    cards: contactCards, locationTitle: 'Địa điểm & bản đồ văn phòng', locationAlt: 'Bản đồ văn phòng GEDECO', office: 'Văn phòng chính GEDECO', address: 'Tầng 14, Tòa nhà Đa năng, số 169 Nguyễn Ngọc Vũ, P. Yên Hòa, TP. Hà Nội', hours: 'Giờ làm việc', schedule: <>Thứ Hai – Thứ Sáu: 08:00 – 17:30<br />Thứ Bảy: 08:00 – 12:00</>, quickTitle: 'LIÊN HỆ NHANH VỚI CHÚNG TÔI', call: 'Gọi Hotline', zalo: 'Chat qua Zalo', zaloCopy: 'Tư vấn nhanh, tiện lợi', messenger: 'Nhắn Messenger', messengerCopy: 'Hỗ trợ & giải đáp trực tiếp', faqEyebrow: 'HỖ TRỢ KHÁCH HÀNG', faqTitle: 'Các câu hỏi thường gặp khi liên hệ GEDECO', faqQuestions: ['GEDECO hỗ trợ những nhu cầu nào?', 'Tôi có thể nhận báo giá trong bao lâu?', 'GEDECO có làm việc với doanh nghiệp ở ngoài Hà Nội không?', 'Làm thế nào để trở thành đối tác của GEDECO?'], faqAnswer: 'Đội ngũ GEDECO sẽ tiếp nhận thông tin và phản hồi theo nhu cầu cụ thể của doanh nghiệp.', ctaTitle: 'Bắt đầu hợp tác cùng GEDECO ngay hôm nay', ctaText: undefined
  };
  return <InnerPage active={copy.active} pageClass="contact-design" language={language}>
    <InnerHero eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
    <section className="contact-intro"><div className="container inner-split"><div className="inner-image"><img src="/assets/banner-2.jpg" alt={copy.imageAlt} /></div><div><p className="eyebrow gold-text">(GEDECO CORPORATION)</p><h2>{english ? 'GEDECO CORPORATION' : 'CÔNG TY CỔ PHẦN GEDECO'}</h2><p>Hotline: +84 914.94.3653<br />Email: info@gedeco.vn<br />Website: www.gedeco.vn</p><p>{copy.intro}</p></div></div></section>
    <section className="contact-card-band"><div className="container contact-card-grid">{copy.cards.map(([icon, title, value, cardCopy]) => <article key={title}><Icon name={icon as any} /><div><h3>{title}</h3><b>{value}</b><p>{cardCopy}</p></div></article>)}</div></section>
    <section className="contact-page"><div className="container contact-page-grid"><ContactForm english={english} /><div className="contact-location"><h2>{copy.locationTitle}</h2><div className="contact-map"><img src="/assets/banner-2.jpg" alt={copy.locationAlt} /><span><Icon name="pin" /> GEDECO</span></div><div className="contact-info-list"><div><Icon name="pin" /><span><b>{copy.office}</b><span>{copy.address}</span></span></div><div><Icon name="chart" /><span><b>{copy.hours}</b><span>{copy.schedule}</span></span></div></div></div></div></section>
    <section className="quick-contact"><div className="container"><h2>{copy.quickTitle}</h2><div className="quick-contact-grid"><a href="tel:0914943653"><Icon name="phone" /><span><b>{copy.call}</b>0914 94 3653</span><Icon name="arrow" /></a><a href="https://zalo.me/0914943653" target="_blank" rel="noopener noreferrer"><span className="chat-badge zalo">Zalo</span><span><b>{copy.zalo}</b>{copy.zaloCopy}</span><Icon name="arrow" /></a><a href="https://www.facebook.com/www.gedeco.tra.thuong.hang" target="_blank" rel="noopener noreferrer"><span className="chat-badge messenger">M</span><span><b>{copy.messenger}</b>{copy.messengerCopy}</span><Icon name="arrow" /></a></div></div></section>
    <section className="faq-section"><div className="container faq-layout"><div><p className="eyebrow">{copy.faqEyebrow}</p><h2>{copy.faqTitle}</h2></div><div className="faq-grid">{copy.faqQuestions.map((question) => <details key={question}><summary>{question}<Icon name="chevron" /></summary><p>{copy.faqAnswer}</p></details>)}</div></div></section>
    <CTA language={language} title={copy.ctaTitle} text={copy.ctaText} />
  </InnerPage>;
}
