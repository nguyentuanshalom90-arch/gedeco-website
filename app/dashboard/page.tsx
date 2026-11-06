import { DashboardClient, type DashboardTab } from './DashboardClient';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ view?: string; tab?: string }> }) {
  const params = await searchParams;
  const allowedTabs: DashboardTab[] = ['overview', 'posts', 'content', 'chrome', 'payment', 'shipping'];
  const initialTab = allowedTabs.includes(params.tab as DashboardTab) ? params.tab as DashboardTab : 'overview';
  return params.view === 'dashboard' ? <DashboardClient initialTab={initialTab} /> : <LoginForm />;
}
