import type { Metadata } from 'next';
import SupportPage from '../components/support-pages';
export const metadata: Metadata = { title: 'Hướng dẫn mua hàng', description: 'Hướng dẫn lựa chọn sản phẩm, gửi nhu cầu và xác nhận đơn hàng với GEDECO.' };
export default function Page() { return <SupportPage page="ordering" />; }
