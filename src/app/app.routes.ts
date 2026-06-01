import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { DashboardHomeComponent } from './features/dashboard/dashboard-home.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout.component';
import { RolesListComponent } from './configuration/roles/roles-list.component';
import { RolePermissionsComponent } from './configuration/roles/role-permissions.component';
import { roleGuard } from './core/auth/role.guard';
import { UsersListComponent } from './features/users/users-list.component';
import { UserDetailComponent } from './features/users/user-detail.component';
import { UserFormComponent } from './features/users/user-form.component';
import { ConfigurationsHubComponent } from './features/dashboard/configurations-hub.component';
import { SystemHubComponent } from './features/dashboard/system-hub.component';
import { AuditLogListComponent } from './features/system/audit-log/audit-log-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [guestGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login', component: LoginComponent, title: 'Sign in' },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: 'Forgot password'
      }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHomeComponent, title: 'Dashboard' },
      { path: 'configurations', component: ConfigurationsHubComponent, title: 'Configurations' },
      { path: 'configurations/manage-codes', component: ConfigurationComponent, title: 'Manage Codes' },
      { path: 'configurations/roles', component: RolesListComponent, title: 'Roles' },
      {
        path: 'configurations/roles/:roleId/permissions',
        component: RolePermissionsComponent,
        title: 'Role permissions'
      },
      {
        path: 'users',
        component: UsersListComponent,
        title: 'Users',
        canActivate: [roleGuard],
        data: { roles: ['system_admin'] },
      },
      {
        path: 'users/new',
        component: UserFormComponent,
        title: 'Create user',
        canActivate: [roleGuard],
        data: { roles: ['system_admin'] },
      },
      {
        path: 'users/:id/edit',
        component: UserFormComponent,
        title: 'Edit user',
        canActivate: [roleGuard],
        data: { roles: ['system_admin'] },
      },
      {
        path: 'users/:id',
        component: UserDetailComponent,
        title: 'User details',
        canActivate: [roleGuard],
        data: { roles: ['system_admin'] },
      },
      {
        path: 'system',
        component: SystemHubComponent,
        title: 'System',
        canActivate: [roleGuard],
        data: { roles: ['system_admin'] },
      },
      {
        path: 'system/audit-logs',
        component: AuditLogListComponent,
        title: 'Audit Log',
        canActivate: [roleGuard],
        data: { roles: ['system_admin'] },
      },

      // Backward-compatible redirects
      { path: 'configuration', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
      { path: 'settings', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
      { path: 'settings/manage-codes', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
