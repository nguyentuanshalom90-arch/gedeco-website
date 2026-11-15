import type { Metadata } from 'next';
import SupportPage from '../components/support-pages';
export const metadata: Metadata = { title: 'Đổi trả và bảo hành', description: 'Điều kiện tiếp nhận, quy trình xử lý đổi trả và bảo hành tại GEDECO.' };
export default function Page() { return <SupportPage page="returns" />; }
