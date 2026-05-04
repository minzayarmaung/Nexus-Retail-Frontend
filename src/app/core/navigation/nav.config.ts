import type { UserRole } from '../user/user.model';

export type NavIcon =
  | 'home'
  | 'users'
  | 'building'
  | 'shield'
  | 'cog'
  | 'store'
  | 'team'
  | 'chart'
  | 'box'
  | 'cart'
  | 'calendar'
  | 'clock'
  | 'check';

export interface NavItem {
  /** Router link segments under `/dashboard` */
  path: string[];
  labelKey: string;
  icon: NavIcon;
  sectionKey: 'sidebar.sectionMain' | 'sidebar.sectionAdmin' | 'sidebar.sectionStore' | 'sidebar.sectionMe';
  children?: NavItem[];
}

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  system_admin: [
    {
      path: [],
      labelKey: 'menu.dashboard',
      icon: 'home',
      sectionKey: 'sidebar.sectionMain'
    },
    {
      path: ['section', 'users'],
      labelKey: 'menu.users',
      icon: 'users',
      sectionKey: 'sidebar.sectionAdmin'
    },
    {
      path: ['section', 'companies'],
      labelKey: 'menu.companies',
      icon: 'building',
      sectionKey: 'sidebar.sectionAdmin'
    },
    {
      path: ['section', 'audit'],
      labelKey: 'menu.audit',
      icon: 'shield',
      sectionKey: 'sidebar.sectionAdmin'
    },
    {
      path: ['settings'],
      labelKey: 'menu.settings',
      icon: 'cog',
      sectionKey: 'sidebar.sectionAdmin',
      children: [
        {
          path: ['settings', 'manage-codes'],
          labelKey: 'menu.manageCodes',
          icon: 'cog',
          sectionKey: 'sidebar.sectionAdmin'
        }
      ]
    }
  ],
  company_admin: [
    {
      path: [],
      labelKey: 'menu.dashboard',
      icon: 'home',
      sectionKey: 'sidebar.sectionMain'
    },
    {
      path: ['section', 'stores'],
      labelKey: 'menu.stores',
      icon: 'store',
      sectionKey: 'sidebar.sectionStore'
    },
    {
      path: ['section', 'staff'],
      labelKey: 'menu.staff',
      icon: 'team',
      sectionKey: 'sidebar.sectionStore'
    },
    {
      path: ['section', 'reports'],
      labelKey: 'menu.reports',
      icon: 'chart',
      sectionKey: 'sidebar.sectionStore'
    },
    {
      path: ['settings'],
      labelKey: 'menu.settings',
      icon: 'cog',
      sectionKey: 'sidebar.sectionAdmin',
      children: [
        {
          path: ['settings', 'manage-codes'],
          labelKey: 'menu.manageCodes',
          icon: 'cog',
          sectionKey: 'sidebar.sectionAdmin'
        }
      ]
    }
  ],
  store_manager: [
    {
      path: [],
      labelKey: 'menu.dashboard',
      icon: 'home',
      sectionKey: 'sidebar.sectionMain'
    },
    {
      path: ['section', 'inventory'],
      labelKey: 'menu.inventory',
      icon: 'box',
      sectionKey: 'sidebar.sectionStore'
    },
    {
      path: ['section', 'sales'],
      labelKey: 'menu.sales',
      icon: 'cart',
      sectionKey: 'sidebar.sectionStore'
    },
    {
      path: ['section', 'schedules'],
      labelKey: 'menu.schedules',
      icon: 'calendar',
      sectionKey: 'sidebar.sectionStore'
    },
    {
      path: ['settings'],
      labelKey: 'menu.settings',
      icon: 'cog',
      sectionKey: 'sidebar.sectionAdmin',
      children: [
        {
          path: ['settings', 'manage-codes'],
          labelKey: 'menu.manageCodes',
          icon: 'cog',
          sectionKey: 'sidebar.sectionAdmin'
        }
      ]
    }
  ],
  staff: [
    {
      path: [],
      labelKey: 'menu.dashboard',
      icon: 'home',
      sectionKey: 'sidebar.sectionMain'
    },
    {
      path: ['section', 'my-shifts'],
      labelKey: 'menu.myShifts',
      icon: 'clock',
      sectionKey: 'sidebar.sectionMe'
    },
    {
      path: ['section', 'tasks'],
      labelKey: 'menu.tasks',
      icon: 'check',
      sectionKey: 'sidebar.sectionMe'
    },
    {
      path: ['settings'],
      labelKey: 'menu.settings',
      icon: 'cog',
      sectionKey: 'sidebar.sectionAdmin',
      children: [
        {
          path: ['settings', 'manage-codes'],
          labelKey: 'menu.manageCodes',
          icon: 'cog',
          sectionKey: 'sidebar.sectionAdmin'
        }
      ]
    }
  ]
};
