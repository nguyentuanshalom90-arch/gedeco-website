import type { Metadata } from 'next';
import { Icon, InnerHero, InnerPage, NewsCard } from '../../components/inner-pages';
import { innerNews } from '../../data';

export const metadata: Metadata = {
  title: 'Xu hướng chuỗi cung ứng toàn cầu 2025',
  description: 'Phân tích xu hướng chuỗi cung ứng, cơ hội và giải pháp nâng cao năng lực cạnh tranh cho doanh nghiệp Việt.',
  alternates: { canonical: '/tin-tuc/chi-tiet' },
};

export default function NewsDetailPage() {
  return <InnerPage active="Tin tức" pageClass="article-design">
    <InnerHero eyebrow="TIN TỨC" title="Chi tiết tin tức" subtitle="" />
    <article className="article-layout"><div className="container article-grid">
      <div className="article-main">
        <p className="eyebrow gold-text">XU HƯỚNG THỊ TRƯỜNG · 15/01/2025 · 8 PHÚT ĐỌC</p>
        <h2>Xu hướng chuỗi cung ứng toàn cầu 2025: Cơ hội và giải pháp cho doanh nghiệp Việt</h2>
        <p className="article-lead">Bước sang năm 2025, chuỗi cung ứng toàn cầu tiếp tục có những dịch chuyển mạnh mẽ dưới tác động của công nghệ, địa chính trị và yêu cầu phát triển bền vững.</p>
        <img className="article-cover" src="/assets/banner-1.jpg" alt="Tàu hàng trên tuyến vận tải quốc tế" />
        <h3>1. Những xu hướng nổi bật định hình chuỗi cung ứng năm 2025</h3>
        <p>Chuỗi cung ứng toàn cầu đang bước vào giai đoạn tái cấu trúc sâu rộng, tập trung vào số hóa, tự động hóa toàn diện, phát triển bền vững và đa dạng hóa để tăng cường khả năng chống chịu.</p>
        <div className="article-feature-list"><div><Icon name="chart" /><span><b>Số hóa và tự động hóa toàn diện</b><p>Trí tuệ nhân tạo, dữ liệu lớn và Internet vạn vật giúp tối ưu chi phí và tăng tính linh hoạt.</p></span></div><div><Icon name="globe" /><span><b>Phát triển bền vững và chuỗi cung ứng xanh</b><p>Doanh nghiệp ngày càng ưu tiên tiêu chuẩn ESG, giảm phát thải và sử dụng nguồn lực hiệu quả.</p></span></div><div><Icon name="box" /><span><b>Đa dạng hóa và tăng cường khả năng chống chịu</b><p>Xu hướng đa nguồn cung và dịch chuyển sản xuất giúp giảm rủi ro gián đoạn.</p></span></div></div>
        <blockquote>“Chuỗi cung ứng không còn chỉ là bài toán vận hành, mà đã trở thành lợi thế cạnh tranh chiến lược.”</blockquote>
        <h3>2. Cơ hội cho doanh nghiệp Việt Nam</h3>
        <p>Với vị trí chiến lược, môi trường đầu tư ổn định và mạng lưới hiệp định thương mại rộng khắp, Việt Nam đang trở thành điểm đến hấp dẫn trong chuỗi cung ứng khu vực.</p>
        <h3>3. Giải pháp từ GEDECO</h3>
        <ul className="article-checks"><li>Giải pháp logistics trọn gói, tối ưu chi phí và thời gian chuyên chở.</li><li>Tư vấn thiết kế chuỗi cung ứng phù hợp với đặc thù từng ngành hàng.</li><li>Hỗ trợ doanh nghiệp đáp ứng các tiêu chuẩn quốc tế và yêu cầu thị trường.</li></ul>
        <h3>4. Kết luận</h3>
        <p>Doanh nghiệp cần chủ động nắm bắt xu hướng, đầu tư công nghệ, phát triển bền vững và lựa chọn đối tác logistics uy tín để tạo lợi thế cạnh tranh dài hạn.</p>
        <div className="article-share"><span>Chia sẻ bài viết</span><a href="#" aria-label="Facebook"><Icon name="facebook" /></a><a href="#" aria-label="LinkedIn"><Icon name="linkedin" /></a></div>
      </div>
      <aside className="article-side"><div className="side-box article-fact"><h3>Việt Nam – Điểm đến hấp dẫn trong chuỗi cung ứng toàn cầu</h3><b>+6,8%</b><span>Tăng trưởng GDP năm 2024</span><b>+15,7%</b><span>Kim ngạch xuất khẩu</span></div><div className="side-box"><h3>Tin liên quan</h3>{innerNews.slice(1).map(item => <NewsCard key={item[3]} item={item} />)}</div></aside>
    </div></article>
    <section className="related-news"><div className="container"><div className="inner-title"><p className="eyebrow gold-text">BÀI VIẾT LIÊN QUAN</p><h2>Thông tin bạn có thể quan tâm</h2></div><div className="inner-news-grid">{innerNews.map(item => <NewsCard key={`${item[3]}-related`} item={item} />)}</div></div></section>
    <section className="inner-cta"><div className="container"><p className="eyebrow">TRAO ĐỔI CÙNG CHUYÊN GIA GEDECO</p><h2>Kết nối để nhận giải pháp phù hợp</h2><p>Bạn cần tư vấn giải pháp logistics, chuỗi cung ứng hoặc hỗ trợ mở rộng thị trường?</p><div className="hero-actions"><a className="button button-gold" href="/lien-he">Liên hệ ngay <Icon name="arrow" /></a><a className="button button-outline light" href="mailto:info@gedeco.vn">Gửi yêu cầu tư vấn</a></div></div></section>
  </InnerPage>;
}
