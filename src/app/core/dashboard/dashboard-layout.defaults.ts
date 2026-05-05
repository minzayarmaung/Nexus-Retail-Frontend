import type { UserRole } from '../user/user.model';
import type { DashboardLayoutState } from './dashboard-layout.models';

export const DASHBOARD_LAYOUT_DEFAULTS: Record<UserRole, DashboardLayoutState> = {
  system_admin: {
    version: 1,
    role: 'system_admin',
    items: [
      { id: 'salesTrend', x: 0, y: 0, w: 6, h: 4 },
      { id: 'revenueByStore', x: 6, y: 0, w: 6, h: 4 },
      { id: 'stockStatus', x: 0, y: 4, w: 4, h: 4 },
      { id: 'topProducts', x: 4, y: 4, w: 8, h: 4 },
      { id: 'tasks', x: 0, y: 8, w: 7, h: 4 },
      { id: 'announcements', x: 7, y: 8, w: 5, h: 4 }
    ]
  },
  company_admin: {
    version: 1,
    role: 'company_admin',
    items: [
      { id: 'salesTrend', x: 0, y: 0, w: 7, h: 4 },
      { id: 'revenueByStore', x: 7, y: 0, w: 5, h: 4 },
      { id: 'topProducts', x: 0, y: 4, w: 7, h: 4 },
      { id: 'stockStatus', x: 7, y: 4, w: 5, h: 4 },
      { id: 'tasks', x: 0, y: 8, w: 7, h: 4 },
      { id: 'announcements', x: 7, y: 8, w: 5, h: 4 }
    ]
  },
  store_manager: {
    version: 1,
    role: 'store_manager',
    items: [
      { id: 'salesTrend', x: 0, y: 0, w: 8, h: 4 },
      { id: 'stockStatus', x: 8, y: 0, w: 4, h: 4 },
      { id: 'revenueByStore', x: 0, y: 4, w: 6, h: 4 },
      { id: 'topProducts', x: 6, y: 4, w: 6, h: 4 },
      { id: 'tasks', x: 0, y: 8, w: 7, h: 4 },
      { id: 'announcements', x: 7, y: 8, w: 5, h: 4 }
    ]
  },
  staff: {
    version: 1,
    role: 'staff',
    items: [
      { id: 'tasks', x: 0, y: 0, w: 7, h: 4 },
      { id: 'announcements', x: 7, y: 0, w: 5, h: 4 },
      { id: 'salesTrend', x: 0, y: 4, w: 6, h: 4 },
      { id: 'stockStatus', x: 6, y: 4, w: 6, h: 4 },
      { id: 'revenueByStore', x: 0, y: 8, w: 7, h: 4 },
      { id: 'topProducts', x: 7, y: 8, w: 5, h: 4 }
    ]
  }
};

