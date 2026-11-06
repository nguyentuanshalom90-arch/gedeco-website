import type { Metadata } from 'next';
import { CTA, Icon, InnerHero, InnerPage } from '../components/inner-pages';
import { getPublicSiteContent } from '@/lib/site-content-public';

export const metadata: Metadata = { title: 'Đối tác và hợp tác', description: 'GEDECO kết nối nhà sản xuất, đơn vị gia công và khách hàng phù hợp để phát triển sản phẩm Việt.', alternates: { canonical: '/doi-tac' } };

const journey = [
  ['building','Hiểu đúng nhu cầu','Làm rõ tiêu chuẩn, quy cách, sản lượng và thị trường để tìm đúng nguồn hàng, đúng đối tác.'],
  ['chart','Kết nối minh bạch','Đồng hành cùng nhà sản xuất, đơn vị gia công và khách hàng trong quá trình trao đổi, đánh giá.'],
  ['handshake','Phát triển dài hạn','Xây dựng quan hệ thương mại dựa trên chất lượng, trách nhiệm và khả năng hợp tác bền vững.'],
];

export default async function PartnersPage() {
  const content = await getPublicSiteContent('doi-tac');
  return <InnerPage active="Đối tác" pageClass="partner-project-design">
    <InnerHero eyebrow="ĐỐI TÁC TIN CẬY" title={content.values['hero.title'] || 'Đối tác tin cậy – Cùng phát triển giá trị Việt'} subtitle={content.values['hero.subtitle'] || 'Kết nối nhà sản xuất, đơn vị gia công và khách hàng phù hợp'} />
    <section className="project-overview"><div className="container project-overview-grid"><img src="/assets/service-export-derivative.png" alt="Kết nối đối tác thương mại"/><div><p className="eyebrow gold-text">TỔNG QUAN HỢP TÁC</p><h2>Đưa sản phẩm chất lượng đến đúng khách hàng</h2><p>GEDECO tìm kiếm và kết nối các đối tác có chung định hướng về chất lượng, minh bạch và phát triển lâu dài.</p><a className="button button-gold" href="/lien-he">Trao đổi nhu cầu <Icon name="arrow"/></a></div><aside><p><Icon name="building"/><span><b>Đối tác</b>Nhà sản xuất và đơn vị gia công</span></p><p><Icon name="chart"/><span><b>Lĩnh vực</b>Nông sản, thực phẩm và sản phẩm chế biến</span></p><p><Icon name="pin"/><span><b>Thị trường</b>Trong nước và quốc tế</span></p></aside></div></section>
    <section className="project-journey"><div className="container"><div className="inner-title centered"><p className="eyebrow">HÀNH TRÌNH HỢP TÁC</p><h2>Thấu hiểu – Kết nối – Phát triển</h2></div><div className="journey-grid">{journey.map(([icon,title,copy])=><article key={title}><Icon name={icon as any}/><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>
    <section className="project-gallery"><div className="container"><div className="inner-title"><p className="eyebrow gold-text">HÌNH ẢNH DỰ ÁN</p><h2>Một số hình ảnh triển khai</h2></div><div className="gallery-grid">{['service-sourcing-derivative.png','news-1-derivative.png','news-2-derivative.png','service-export-derivative.png'].map((img,index)=><img key={img} src={`/assets/${img}`} alt={`Hình ảnh dự án ${index+1}`}/>)}</div></div></section>
    <section className="project-metrics"><div className="container inner-stat-grid"><div><Icon name="building"/><b>-18%</b><span>Chi phí logistics</span></div><div><Icon name="chart"/><b>-32%</b><span>Thời gian giao hàng</span></div><div><Icon name="box"/><b>+26%</b><span>Hiệu quả vòng quay tồn kho</span></div><div><Icon name="handshake"/><b>+20%</b><span>Mức độ phục vụ thị trường</span></div></div></section>
    <section className="project-services"><div className="container"><div className="inner-title centered"><p className="eyebrow">DỊCH VỤ LIÊN QUAN</p><h2>Năng lực và dịch vụ GEDECO đã triển khai</h2></div><div className="service-strip">{[['building','Quản lý kho vận (WMS)'],['truck','Vận tải & phân phối'],['globe','Tối ưu chuỗi cung ứng'],['chart','Ứng dụng công nghệ (TMS)']].map(([icon,title],index)=><article key={title} style={{backgroundImage:`linear-gradient(90deg,rgba(3,30,65,.8),rgba(3,30,65,.15)),url('/assets/${['service-sourcing-derivative.png','news-1-derivative.png','news-3-derivative.png','service-logistics-derivative.png'][index]}')`}}><Icon name={icon as any}/><b>{title}</b></article>)}</div></div></section>
    <section className="related-projects"><div className="container"><div className="inner-title"><p className="eyebrow gold-text">DỰ ÁN LIÊN QUAN</p><h2>Các dự án tiêu biểu khác</h2></div><div className="related-project-grid">{[['news-1-derivative.png','Dự án Mở rộng mạng lưới phân phối hàng gia dụng'],['service-export-derivative.png','Dự án Tối ưu vận hành chuỗi cung ứng ngành dược phẩm'],['news-2-derivative.png','Dự án Tăng hiệu quả logistics xuất nhập khẩu hàng điện tử']].map(([img,title])=><article key={title}><img src={`/assets/${img}`} alt={title}/><h3>{title}</h3><p>Giải pháp logistics và chuỗi cung ứng được thiết kế theo nhu cầu thực tế.</p></article>)}</div></div></section>
    <CTA title="Bạn đang tìm giải pháp tối ưu cho chuỗi cung ứng?" />
  </InnerPage>;
}
