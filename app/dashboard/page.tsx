import { DashboardClient } from './DashboardClient';
import { DASHBOARD_TABS, type DashboardTab } from './dashboard-tabs';
import { getDashboardSession } from '@/lib/dashboard/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ view?: string; tab?: string }> }) {
  const params = await searchParams;
  const initialTab = DASHBOARD_TABS.includes(params.tab as DashboardTab) ? params.tab as DashboardTab : 'overview';
  const session = await getDashboardSession();
  if (!session) redirect('/vmg-login');
  return <DashboardClient initialTab={initialTab} />;
}
