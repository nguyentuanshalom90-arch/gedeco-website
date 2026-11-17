import SupportPage, { getSupportMetadata } from '../../components/support-pages';
export const dynamic = 'force-dynamic';
export const generateMetadata = () => getSupportMetadata('ordering', 'en');
export default function Page() { return <SupportPage page="ordering" language="en" />; }
