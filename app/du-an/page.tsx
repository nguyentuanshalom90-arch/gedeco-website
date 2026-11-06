import type { Metadata } from 'next';
import { CTA, Icon, InnerHero, InnerPage } from '../components/inner-pages';
import { getPublicSiteContent } from '@/lib/site-content-public';

export const metadata: Metadata = { title: 'Dự án', description: 'Các dự án phát triển nguồn hàng, thương mại, xuất khẩu và hợp tác bền vững của GEDECO.', alternates: { canonical: '/du-an' } };

const projects = [['service-export-derivative.png','Phát triển nguồn hàng nông sản','Tìm kiếm, đánh giá và xây dựng nguồn hàng nông sản Việt Nam có giá trị.'],['service-sourcing-derivative.png','Hợp tác sản phẩm trà','Kết nối vùng nguyên liệu, đơn vị chế biến và đối tác phân phối phù hợp.'],['service-export-derivative.png','Thương mại sản phẩm chế biến','Đưa sản phẩm chất lượng đến đúng thị trường và khách hàng mục tiêu.'],['service-logistics-derivative.png','Kết nối xuất khẩu','Đồng hành cùng doanh nghiệp trong chuẩn bị, giới thiệu và mở rộng thị trường.'],['news-1-derivative.png','Nông nghiệp sạch','Thúc đẩy các sản phẩm có nguồn gốc rõ ràng và giá trị bền vững.'],['news-3-derivative.png','Đào tạo và chuyển giao','Chia sẻ kinh nghiệm để nâng cao năng lực hợp tác và phát triển thị trường.']];

export default async function ProjectsPage() {
  const content = await getPublicSiteContent('du-an');
  return <InnerPage active="" pageClass="projects-design"><InnerHero eyebrow="GEDECO" title={content.values['hero.title'] || 'Dự án tiêu biểu – Dấu ấn hợp tác toàn cầu'} subtitle={content.values['hero.subtitle'] || 'Tổng hợp các dự án nổi bật GEDECO đã triển khai cùng đối tác trong và ngoài nước.'} />
    <section className="inner-intro"><div className="container inner-split"><div className="inner-image"><img src="/assets/banner-2.jpg" alt="Dự án phát triển nguồn hàng và hợp tác thương mại" /></div><div><p className="eyebrow gold-text">DỰ ÁN GEDECO</p><h2>{content.values['intro.title'] || 'Từ nguồn hàng chất lượng đến cơ hội hợp tác'}</h2><p>Mỗi dự án là một câu chuyện hợp tác, nơi GEDECO kết nối nhà sản xuất, đơn vị gia công và khách hàng có nhu cầu phù hợp.</p><p>Chúng tôi ưu tiên chất lượng, minh bạch và khả năng phát triển lâu dài trong từng chương trình thương mại.</p><a className="button button-gold" href="/lien-he">Trao đổi dự án <Icon name="arrow" /></a></div></div></section>
    <section className="inner-projects"><div className="container"><div className="inner-title"><p className="eyebrow gold-text">DANH MỤC DỰ ÁN</p><h2>Những giải pháp đã triển khai</h2></div><div className="project-filters"><button className="active">Tất cả</button><button>Thương mại</button><button>Xuất khẩu</button><button>Logistics</button></div><div className="project-grid">{projects.map(([img,title,copy],i) => <article key={title} className={i===0 ? 'featured' : ''}><img src={`/assets/${img}`} alt={title} /><div><p className="eyebrow gold-text">{i%2===0 ? 'THƯƠNG MẠI' : 'LOGISTICS'}</p><h3>{title}</h3><p>{copy}</p><a href="/lien-he">Xem dự án <Icon name="arrow" /></a></div></article>)}</div></div></section>
    <CTA title="Bạn đang có một dự án cần đồng hành?" text="Hãy trao đổi với GEDECO để cùng tìm ra hướng triển khai hiệu quả." />
  </InnerPage>;
}
