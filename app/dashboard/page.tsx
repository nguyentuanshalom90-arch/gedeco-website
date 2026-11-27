import { DashboardClient } from './DashboardClient';
import { DASHBOARD_TABS, type DashboardTab } from './dashboard-tabs';
import { getDashboardSession, ensureDefaultSuperAdmin } from '@/lib/dashboard/auth';
import { isTabAllowedForRole, getDefaultTabForRole } from '@/lib/dashboard/roles';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ view?: string; tab?: string; area?: string; page?: string }> }) {
  const params = await searchParams;
  const session = await getDashboardSession();
  if (!session) redirect('/vmg-login');

  // Ensure default super admin exists in DB
  await ensureDefaultSuperAdmin().catch(() => undefined);

  const requestedTab = DASHBOARD_TABS.includes(params.tab as DashboardTab)
    ? (params.tab as DashboardTab)
    : undefined;

  let initialTab: DashboardTab = requestedTab || getDefaultTabForRole(session.role);
  if (requestedTab && !isTabAllowedForRole(session.role, requestedTab)) {
    initialTab = getDefaultTabForRole(session.role);
  }
  const requestedArea = (params.area || "").toUpperCase();
  const initialSiteArea = ["HEADER", "FOOTER", "BODY"].includes(requestedArea) ? requestedArea as "HEADER" | "FOOTER" | "BODY" : "HEADER";

  return (
    <DashboardClient
      initialTab={initialTab}
      currentUser={{
        username: session.username,
        displayName: session.displayName || session.username,
        role: session.role,
      }}
      initialSiteArea={initialSiteArea}
      initialSitePageKey={params.page || "home"}
    />
  );
}
