import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';
import { ConfigurationComponent } from './dashboard/configuration/configuration.component';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout.component';
import { EmployeeManagementComponent } from './dashboard/employee/employee-management.component';
import { ProfileComponent } from './dashboard/profile/profile.component';
import { ShopDetailComponent } from './dashboard/shop/shop-detail.component';
import { ShopManagementComponent } from './dashboard/shop/shop-management.component';
import { UsersManagementComponent } from './dashboard/users/users-management.component';
import { SectionPlaceholderComponent } from './dashboard/section-placeholder.component';

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
      {
        path: 'users',
        component: UsersManagementComponent,
        title: 'Users',
        canActivate: [roleGuard],
        data: { roles: ['system_admin'] }
      },
      {
        path: 'employees',
        component: EmployeeManagementComponent,
        title: 'Employees',
        canActivate: [roleGuard],
        data: { roles: ['company_admin'] }
      },
      {
        path: 'shops',
        component: ShopManagementComponent,
        title: 'Shops',
        canActivate: [roleGuard],
        data: { roles: ['system_admin'] }
      },
      {
        path: 'shops/:shopId',
        component: ShopDetailComponent,
        title: 'Shop Detail',
        canActivate: [roleGuard],
        data: { roles: ['system_admin'] }
      },
      {
        path: 'shop-owners',
        pathMatch: 'full',
        redirectTo: 'shops'
      },
      { path: 'configurations', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
      { path: 'configurations/manage-codes', component: ConfigurationComponent, title: 'Manage Codes' },

      // Backward-compatible redirects
      { path: 'configuration', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
      { path: 'settings', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
      { path: 'settings/manage-codes', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
      { path: 'profile', component: ProfileComponent, title: 'Profile' },
      { path: 'section/:slug', component: SectionPlaceholderComponent }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
