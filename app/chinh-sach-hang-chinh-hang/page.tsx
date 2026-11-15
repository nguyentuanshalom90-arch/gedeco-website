import type { Metadata } from 'next';
import SupportPage from '../components/support-pages';
export const metadata: Metadata = { title: 'Chính sách hàng chính hãng', description: 'Chính sách nguồn gốc, kiểm tra và hỗ trợ sản phẩm của GEDECO.' };
export default function Page() { return <SupportPage page="authentic" />; }
