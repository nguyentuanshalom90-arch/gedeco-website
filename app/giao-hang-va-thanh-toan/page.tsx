import type { Metadata } from 'next';
import SupportPage from '../components/support-pages';
export const metadata: Metadata = { title: 'Giao hàng và thanh toán', description: 'Thông tin giao nhận, thời gian dự kiến và phương thức thanh toán tại GEDECO.' };
export default function Page() { return <SupportPage page="shipping" />; }
