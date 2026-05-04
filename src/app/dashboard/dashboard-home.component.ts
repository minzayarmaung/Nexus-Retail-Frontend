import { Component, computed, inject } from '@angular/core';
import { DASHBOARD_METRICS } from '../core/dashboard/dashboard-metrics';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { SessionService } from '../core/user/session.service';

@Component({
  selector: 'app-dashboard-home',
  imports: [TranslatePipe],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent {
  private readonly session = inject(SessionService);

  protected readonly user = this.session.user;
  protected readonly metrics = computed(() => {
    const role = this.session.user()?.role;
    if (!role) {
      return [];
    }
    return DASHBOARD_METRICS[role];
  });

  protected i18nPrefix(): string {
    const role = this.session.user()?.role;
    return role ? `dashboard.${role}.` : 'dashboard.system_admin.';
  }
}
