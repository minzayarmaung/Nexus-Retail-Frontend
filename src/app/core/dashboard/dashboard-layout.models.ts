import type { UserRole } from '../user/user.model';

export type DashboardWidgetId =
  | 'salesTrend'
  | 'revenueByStore'
  | 'topProducts'
  | 'stockStatus'
  | 'tasks'
  | 'announcements';

export interface DashboardWidgetLayoutItem {
  id: DashboardWidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  hidden?: boolean;
}

export interface DashboardLayoutState {
  version: 1;
  role: UserRole;
  items: DashboardWidgetLayoutItem[];
}

