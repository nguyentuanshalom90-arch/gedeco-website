import type { Metadata } from 'next';
import { InnerHero, InnerPage } from './inner-pages';
import { getPublicSiteContent } from '@/lib/site-content-public';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

export type SupportPageKey = 'authentic' | 'ordering' | 'shipping' | 'returns';

type SupportCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: Array<{ heading: string; paragraphs?: string[]; bullets?: string[] }>;
};

const copy: Record<'vi' | 'en', Record<SupportPageKey, SupportCopy>> = {
  vi: {
    authentic: {
      eyebrow: 'HỖ TRỢ KHÁCH HÀNG',
      title: 'Chính sách hàng chính hãng',
      subtitle: 'GEDECO minh bạch nguồn gốc và đồng hành cùng khách hàng trong suốt quá trình lựa chọn sản phẩm.',
      sections: [
        { heading: 'Cam kết về nguồn gốc', paragraphs: ['GEDECO ưu tiên các sản phẩm có thông tin nhà sản xuất, đơn vị cung ứng và nguồn gốc rõ ràng. Trước khi đưa vào danh mục, sản phẩm được rà soát theo hồ sơ và tiêu chuẩn phù hợp với từng nhóm hàng.', 'Thông tin về xuất xứ, thành phần, quy cách và hướng dẫn sử dụng được cung cấp theo hồ sơ sản phẩm thực tế. Khách hàng có thể liên hệ để được tư vấn thêm trước khi đặt hàng.'] },
        { heading: 'Kiểm tra khi nhận hàng', bullets: ['Đối chiếu tên sản phẩm, số lượng và quy cách với thông tin trong đơn hàng.', 'Kiểm tra tình trạng bao bì, tem nhãn và dấu hiệu bất thường trước khi nhận.', 'Chụp ảnh hoặc quay video khi mở kiện nếu sản phẩm có dấu hiệu móp, rách, thiếu hoặc không đúng đơn.', 'Liên hệ GEDECO trong vòng 48 giờ kể từ khi nhận hàng để được tiếp nhận và hướng dẫn xử lý.'] },
        { heading: 'Hỗ trợ sau mua', paragraphs: ['Nếu cần xác minh thông tin sản phẩm hoặc gặp vấn đề trong quá trình sử dụng, vui lòng gửi mã đơn hàng, hình ảnh sản phẩm và mô tả tình trạng qua Hotline 0914 94 3653 hoặc email info@gedeco.vn.'] },
      ],
    },
    ordering: {
      eyebrow: 'HỖ TRỢ KHÁCH HÀNG',
      title: 'Hướng dẫn mua hàng',
      subtitle: 'Quy trình đặt hàng đơn giản, rõ ràng và có nhân viên GEDECO đồng hành khi bạn cần tư vấn.',
      sections: [
        { heading: 'Bước 1: Chọn sản phẩm', paragraphs: ['Xem danh mục sản phẩm, thông tin mô tả và quy cách trên website. Nếu cần sản phẩm theo số lượng, thị trường hoặc tiêu chuẩn riêng, bạn có thể gửi yêu cầu để GEDECO tư vấn.'] },
        { heading: 'Bước 2: Gửi nhu cầu', bullets: ['Bấm nút liên hệ hoặc gửi yêu cầu báo giá.', 'Cung cấp tên sản phẩm, số lượng dự kiến, khu vực nhận hàng và thông tin liên hệ.', 'Với đơn hàng doanh nghiệp, nên ghi thêm yêu cầu về chứng từ, quy cách đóng gói hoặc thời gian giao.'] },
        { heading: 'Bước 3: Xác nhận đơn hàng', paragraphs: ['Nhân viên GEDECO sẽ liên hệ để xác nhận sản phẩm, số lượng, giá, phí giao hàng và thời gian dự kiến. Đơn hàng chỉ được xử lý sau khi hai bên thống nhất các thông tin cần thiết.'] },
        { heading: 'Bước 4: Nhận hàng và thanh toán', paragraphs: ['Khách hàng nhận hàng theo phương thức đã xác nhận. Vui lòng kiểm tra kiện hàng trước khi hoàn tất thanh toán và phản hồi sớm nếu có sai lệch.'] },
      ],
    },
    shipping: {
      eyebrow: 'HỖ TRỢ KHÁCH HÀNG',
      title: 'Giao hàng và thanh toán',
      subtitle: 'GEDECO phối hợp phương án giao nhận phù hợp với từng đơn hàng, khu vực và yêu cầu của khách hàng.',
      sections: [
        { heading: 'Phương thức giao hàng', paragraphs: ['Đơn hàng được giao theo địa chỉ khách hàng cung cấp và phương án đã xác nhận. Tùy khu vực, GEDECO có thể phối hợp đơn vị vận chuyển phù hợp hoặc sắp xếp giao trực tiếp với đơn hàng cần hỗ trợ riêng.'] },
        { heading: 'Thời gian giao dự kiến', paragraphs: ['Thời gian giao phụ thuộc vào địa chỉ nhận, tình trạng hàng, khối lượng và đơn vị vận chuyển. Nhân viên GEDECO sẽ thông báo thời gian dự kiến khi xác nhận đơn. Các trường hợp thời tiết, lễ tết hoặc phát sinh vận chuyển có thể làm thay đổi lịch giao.'] },
        { heading: 'Thanh toán', bullets: ['Thanh toán khi nhận hàng nếu phương án này được xác nhận cho đơn hàng.', 'Chuyển khoản theo thông tin thanh toán do GEDECO cung cấp khi xác nhận đơn.', 'Đơn hàng doanh nghiệp có thể áp dụng phương án thanh toán riêng theo thỏa thuận bằng văn bản.'] },
        { heading: 'Thay đổi thông tin giao nhận', paragraphs: ['Nếu cần đổi địa chỉ, số lượng hoặc thời gian nhận hàng, vui lòng liên hệ GEDECO sớm trước khi đơn được bàn giao cho đơn vị vận chuyển. Chi phí phát sinh, nếu có, sẽ được thông báo trước khi thực hiện.'] },
      ],
    },
    returns: {
      eyebrow: 'HỖ TRỢ KHÁCH HÀNG',
      title: 'Đổi trả và bảo hành',
      subtitle: 'GEDECO tiếp nhận phản hồi minh bạch và ưu tiên phương án xử lý hợp lý cho từng trường hợp.',
      sections: [
        { heading: 'Trường hợp được tiếp nhận đổi trả', bullets: ['Sản phẩm giao không đúng tên, số lượng hoặc quy cách đã xác nhận.', 'Sản phẩm bị hư hỏng do quá trình vận chuyển và có bằng chứng tình trạng khi nhận.', 'Sản phẩm có lỗi kỹ thuật hoặc lỗi từ nhà sản xuất trong thời hạn hỗ trợ được thông báo cho từng sản phẩm.', 'Sản phẩm còn nguyên bao bì, tem nhãn và chưa qua sử dụng, nếu việc đổi trả đã được GEDECO xác nhận trước.'] },
        { heading: 'Thời gian thông báo', paragraphs: ['Vui lòng liên hệ trong vòng 48 giờ kể từ khi nhận hàng đối với trường hợp thiếu, sai hoặc hư hỏng do vận chuyển. Với lỗi kỹ thuật hoặc bảo hành, thời hạn áp dụng theo thông tin của từng sản phẩm và hồ sơ đi kèm.'] },
        { heading: 'Quy trình xử lý', bullets: ['Gửi mã đơn hàng, hình ảnh hoặc video và mô tả vấn đề qua Hotline 0914 94 3653 hoặc email info@gedeco.vn.', 'GEDECO kiểm tra thông tin và có thể hướng dẫn bổ sung hình ảnh, video hoặc gửi sản phẩm về điểm tiếp nhận.', 'Sau khi xác minh, GEDECO thông báo phương án đổi sản phẩm, bổ sung, sửa chữa, bảo hành hoặc hoàn tiền phù hợp.'] },
        { heading: 'Các trường hợp không áp dụng', paragraphs: ['Chính sách không áp dụng cho hư hỏng do sử dụng sai hướng dẫn, tự ý thay đổi sản phẩm, bảo quản không đúng điều kiện, hao mòn tự nhiên hoặc yêu cầu đổi ý sau khi đơn hàng đã được xác nhận, trừ khi hai bên có thỏa thuận khác.'] },
      ],
    },
  },
  en: {
    authentic: { eyebrow: 'CUSTOMER SUPPORT', title: 'Authentic product policy', subtitle: 'GEDECO provides clear product information and supports customers throughout the selection process.', sections: [{ heading: 'Product origin', paragraphs: ['GEDECO prioritizes products with clear information about the manufacturer, supplier and origin. Product information is reviewed against the applicable product file before publication.'] }, { heading: 'When receiving an order', bullets: ['Check the product name, quantity and specification.', 'Inspect packaging and labels before accepting the parcel.', 'Take photos or video if the parcel is damaged, incomplete or incorrect.', 'Contact GEDECO within 48 hours for support.'] }, { heading: 'After-sales support', paragraphs: ['For product verification or usage support, send the order code and photos to +84 914 943 653 or info@gedeco.vn.'] }] },
    ordering: { eyebrow: 'CUSTOMER SUPPORT', title: 'How to order', subtitle: 'A clear ordering process with GEDECO support whenever you need advice.', sections: [{ heading: 'Step 1: Choose a product', paragraphs: ['Review the product catalogue and specifications. For volume, market or custom requirements, send us your request for advice.'] }, { heading: 'Step 2: Send your request', bullets: ['Use the contact or quotation request button.', 'Provide the product, expected quantity, delivery area and contact details.', 'For business orders, include documentation, packaging or delivery requirements.'] }, { heading: 'Step 3: Confirm the order', paragraphs: ['GEDECO will confirm product availability, quantity, price, delivery and estimated timing before processing the order.'] }, { heading: 'Step 4: Receive and pay', paragraphs: ['Receive the order using the confirmed method, check the parcel and contact us promptly if there is any discrepancy.'] }] },
    shipping: { eyebrow: 'CUSTOMER SUPPORT', title: 'Shipping and payment', subtitle: 'GEDECO coordinates a delivery and payment method suitable for each order and destination.', sections: [{ heading: 'Delivery', paragraphs: ['Orders are delivered to the address and by the method confirmed with the customer. Depending on the destination, GEDECO may coordinate a suitable carrier or direct delivery.'] }, { heading: 'Estimated timing', paragraphs: ['Delivery timing depends on destination, stock, volume and the carrier. The estimated timing is confirmed with the order. Holidays, weather and transport conditions may affect the schedule.'] }, { heading: 'Payment', bullets: ['Cash on delivery where this method is confirmed.', 'Bank transfer using the payment details provided by GEDECO.', 'Business orders may use a separate written payment agreement.'] }, { heading: 'Changes to delivery details', paragraphs: ['Contact GEDECO as early as possible if you need to change the address, quantity or delivery timing. Any additional cost will be disclosed before implementation.'] }] },
    returns: { eyebrow: 'CUSTOMER SUPPORT', title: 'Returns and warranty', subtitle: 'GEDECO handles customer feedback transparently and seeks a suitable resolution for each case.', sections: [{ heading: 'Eligible cases', bullets: ['The delivered product, quantity or specification differs from the confirmed order.', 'The product is damaged during delivery and the condition is documented on receipt.', 'The product has a technical or manufacturer defect within its stated support period.', 'The product is unused and retains its original packaging and labels, where GEDECO has approved the return.'] }, { heading: 'Notice period', paragraphs: ['Contact GEDECO within 48 hours for missing, incorrect or delivery-damaged items. Warranty timing follows the product information and accompanying documents.'] }, { heading: 'Resolution process', bullets: ['Send the order code, photos or video and a description to +84 914 943 653 or info@gedeco.vn.', 'GEDECO may request additional evidence or return of the product for inspection.', 'After verification, GEDECO will confirm replacement, completion, repair, warranty or refund options as applicable.'] }, { heading: 'Exclusions', paragraphs: ['The policy does not cover damage caused by misuse, incorrect storage, unauthorized modification, natural wear or a change-of-mind request after order confirmation, unless otherwise agreed.'] }] },
  },
};

const supportConfig: Record<SupportPageKey, { pageKey: string; vi: string; en: string }> = {
  authentic: { pageKey: 'chinh-sach-hang-chinh-hang', vi: '/chinh-sach-hang-chinh-hang', en: '/en/authentic-product-policy' },
  ordering: { pageKey: 'huong-dan-mua-hang', vi: '/huong-dan-mua-hang', en: '/en/how-to-order' },
  shipping: { pageKey: 'giao-hang-va-thanh-toan', vi: '/giao-hang-va-thanh-toan', en: '/en/shipping-and-payment' },
  returns: { pageKey: 'doi-tra-va-bao-hanh', vi: '/doi-tra-va-bao-hanh', en: '/en/returns-and-warranty' },
};

export async function getSupportMetadata(page: SupportPageKey, language: 'vi' | 'en'): Promise<Metadata> {
  const config = supportConfig[page];
  const content = await getPublicSiteContent(config.pageKey, language);
  const fallbackData = copy[language][page];
  const english = language === 'en';
  const translated = content.translatedKeys.length > 0;
  const title = english ? (translated && content.page?.metaTitle ? content.page.metaTitle : fallbackData.title) : content.page?.metaTitle || fallbackData.title;
  const description = english ? (translated && content.page?.metaDescription ? content.page.metaDescription : fallbackData.subtitle) : content.page?.metaDescription || fallbackData.subtitle;
  const canonical = absoluteUrl(english ? config.en : config.vi);
  const vi = absoluteUrl(config.vi);
  const en = absoluteUrl(config.en);
  const hero = content.media['hero.image'];
  return { title, description, alternates: { canonical, languages: { vi, en, 'x-default': vi } }, robots: { index: content.page?.robotsIndex ?? true, follow: content.page?.robotsFollow ?? true }, openGraph: { type: 'website', locale: english ? 'en_US' : 'vi_VN', siteName: siteConfig.brand, url: canonical, title, description, images: hero ? [{ url: absoluteUrl(hero.url), alt: hero.altText || fallbackData.title }] : undefined } };
}

export default async function SupportPage({ page, language = 'vi' }: { page: SupportPageKey; language?: 'vi' | 'en' }) {
  const fallbackData = copy[language][page];
  const config = supportConfig[page];
  const content = await getPublicSiteContent(config.pageKey, language);
  const english = language === 'en';
  const translated = new Set(content.translatedKeys);
  const text = (key: string, fallbackValue: string) => english ? (translated.has(key) ? content.values[key] || fallbackValue : fallbackValue) : content.values[key] || fallbackValue;
  const heroSource = content.media['hero.image'];
  const heroLocalized = !english || translated.has('hero.image');
  const hero = { url: heroSource?.url || '/assets/banner-1.optimized.webp', alt: heroLocalized ? heroSource?.altText || fallbackData.title : fallbackData.title, caption: heroLocalized ? heroSource?.caption || '' : '' };
  const sections = fallbackData.sections.map((section, index) => {
    const key = `section.${index + 1}`;
    const fallbackLines = section.bullets || section.paragraphs || [];
    const bodyValue = text(`${key}.body`, fallbackLines.join('\n'));
    const lines = bodyValue.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const editableLines = config.pageKey === 'doi-tra-va-bao-hanh'
      ? lines.map((line, lineIndex) => text(`${key}.item.${lineIndex + 1}`, line))
      : lines;
    return { key, title: text(`${key}.title`, section.heading), lines: editableLines, bullets: Boolean(section.bullets) };
  });
  const canonical = absoluteUrl(english ? config.en : config.vi);
  const jsonLd = [{ '@context': 'https://schema.org', '@type': 'WebPage', name: text('hero.title', fallbackData.title), description: text('hero.subtitle', fallbackData.subtitle), url: canonical, inLanguage: english ? 'en' : 'vi-VN', isPartOf: { '@type': 'WebSite', name: siteConfig.brand, url: siteConfig.officialUrl } }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: english ? 'Home' : 'Trang chủ', item: absoluteUrl(english ? '/en' : '/') }, { '@type': 'ListItem', position: 2, name: text('hero.title', fallbackData.title), item: canonical }] }];
  return <InnerPage active="" pageClass="support-page" language={language}><InnerHero eyebrow={text('hero.eyebrow', fallbackData.eyebrow)} title={text('hero.title', fallbackData.title)} subtitle={text('hero.subtitle', fallbackData.subtitle)} image={hero.url} imageAlt={hero.alt} imageCaption={hero.caption} /><div className="support-content"><div className="container support-content-inner">{sections.map((section) => <section className="support-section" key={section.title}><h2 data-cms-key={`${section.key}.title`}>{section.title}</h2>{section.bullets ? <ul>{section.lines.map((line, lineIndex) => <li key={`${section.key}-${lineIndex}`} data-cms-key={`${section.key}.item.${lineIndex + 1}`}>{line}</li>)}</ul> : section.lines.map((line, lineIndex) => <p key={`${section.key}-${lineIndex}`} data-cms-key={`${section.key}.item.${lineIndex + 1}`}>{line}</p>)}</section>)}</div></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} /></InnerPage>;
}
