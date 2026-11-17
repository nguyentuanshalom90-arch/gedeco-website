import SupportPage, { getSupportMetadata } from '../components/support-pages';
export const dynamic = 'force-dynamic';
export const generateMetadata = () => getSupportMetadata('ordering', 'vi');
export default function Page() { return <SupportPage page="ordering" />; }
