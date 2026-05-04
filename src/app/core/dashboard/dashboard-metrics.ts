import type { UserRole } from '../user/user.model';

export interface DashboardCard {
  value: string;
  titleKey: string;
  hintKey: string;
}

/** Demo-only figures; replace with API data later. */
export const DASHBOARD_METRICS: Record<UserRole, DashboardCard[]> = {
  system_admin: [
    { value: '12,430', titleKey: 'c1t', hintKey: 'c1h' },
    { value: '186', titleKey: 'c2t', hintKey: 'c2h' },
    { value: '2', titleKey: 'c3t', hintKey: 'c3h' }
  ],
  company_admin: [
    { value: '24', titleKey: 'c1t', hintKey: 'c1h' },
    { value: '318', titleKey: 'c2t', hintKey: 'c2h' },
    { value: 'Ks 482M', titleKey: 'c3t', hintKey: 'c3h' }
  ],
  store_manager: [
    { value: 'Ks 2.1M', titleKey: 'c1t', hintKey: 'c1h' },
    { value: '14', titleKey: 'c2t', hintKey: 'c2h' },
    { value: '7', titleKey: 'c3t', hintKey: 'c3h' }
  ],
  staff: [
    { value: '5', titleKey: 'c1t', hintKey: 'c1h' },
    { value: '2:00 PM', titleKey: 'c2t', hintKey: 'c2h' },
    { value: '3', titleKey: 'c3t', hintKey: 'c3h' }
  ]
};
