import SupportPage, { getSupportMetadata } from '../../components/support-pages';
export const dynamic = 'force-dynamic';
export const generateMetadata = () => getSupportMetadata('shipping', 'en');
export default function Page() { return <SupportPage page="shipping" language="en" />; }
