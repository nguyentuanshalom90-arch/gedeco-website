import SupportPage, { getSupportMetadata } from '../components/support-pages';
export const dynamic = 'force-dynamic';
export const generateMetadata = () => getSupportMetadata('returns', 'vi');
export default function Page() { return <SupportPage page="returns" />; }
