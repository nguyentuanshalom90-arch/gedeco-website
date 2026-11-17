import SupportPage, { getSupportMetadata } from '../../components/support-pages';
export const dynamic = 'force-dynamic';
export const generateMetadata = () => getSupportMetadata('authentic', 'en');
export default function Page() { return <SupportPage page="authentic" language="en" />; }
