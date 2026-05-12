import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { DashboardHomeComponent } from './features/dashboard/dashboard-home.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout.component';

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
      { path: 'configurations', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
      { path: 'configurations/manage-codes', component: ConfigurationComponent, title: 'Manage Codes' },

      // Backward-compatible redirects
      { path: 'configuration', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
      { path: 'settings', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
      { path: 'settings/manage-codes', pathMatch: 'full', redirectTo: 'configurations/manage-codes' },
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
