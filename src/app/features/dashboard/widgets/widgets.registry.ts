import type { UserRole } from '../../../core/user/user.model';
import type { DashboardWidgetId } from '../../../core/dashboard/dashboard-layout.models';

export interface DashboardWidgetDefinition {
  id: DashboardWidgetId;
  title: string;
  subtitle?: string;
  roles: UserRole[];
}

export const DASHBOARD_WIDGETS: DashboardWidgetDefinition[] = [
  {
    id: 'salesTrend',
    title: 'Sales trend',
    subtitle: 'Last 14 days (demo)',
    roles: ['system_admin', 'company_admin', 'store_manager', 'staff']
  },
  {
    id: 'revenueByStore',
    title: 'Revenue by store',
    subtitle: 'This month (demo)',
    roles: ['system_admin', 'company_admin', 'store_manager', 'staff']
  },
  {
    id: 'topProducts',
    title: 'Top products',
    subtitle: 'By revenue (demo)',
    roles: ['system_admin', 'company_admin', 'store_manager', 'staff']
  },
  {
    id: 'stockStatus',
    title: 'Stock status',
    subtitle: 'Live snapshot (demo)',
    roles: ['system_admin', 'company_admin', 'store_manager', 'staff']
  },
  {
    id: 'tasks',
    title: 'Tasks',
    subtitle: 'To review / approve (demo)',
    roles: ['system_admin', 'company_admin', 'store_manager', 'staff']
  },
  {
    id: 'announcements',
    title: 'Announcements',
    subtitle: 'Latest notes (demo)',
    roles: ['system_admin', 'company_admin', 'store_manager', 'staff']
  }
];

export function widgetDef(id: DashboardWidgetId): DashboardWidgetDefinition {
  const found = DASHBOARD_WIDGETS.find((w) => w.id === id);
  if (!found) {
    return { id, title: id, roles: ['system_admin', 'company_admin', 'store_manager', 'staff'] };
  }
  return found;
}

