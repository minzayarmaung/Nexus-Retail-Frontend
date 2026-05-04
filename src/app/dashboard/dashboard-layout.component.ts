import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LanguageSwitcherComponent } from '../core/i18n/language-switcher.component';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { NAV_BY_ROLE, type NavItem } from '../core/navigation/nav.config';
import { avatarDataUrl, resolveAvatarId } from '../core/user/avatars';
import { SessionService } from '../core/user/session.service';
import { NavIconComponent } from './nav-icon.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LanguageSwitcherComponent,
    NavIconComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly sidebarOpen = signal(false);
  protected readonly accountOpen = signal(false);

  protected readonly avatarUrl = (id: string) => avatarDataUrl(resolveAvatarId(id));

  protected readonly navGroups = computed(() => {
    const role = this.session.user()?.role;
    if (!role) {
      return [];
    }
    const items = NAV_BY_ROLE[role];
    const groups: { sectionKey: NavItem['sectionKey']; items: NavItem[] }[] = [];
    for (const it of items) {
      const last = groups[groups.length - 1];
      if (!last || last.sectionKey !== it.sectionKey) {
        groups.push({ sectionKey: it.sectionKey, items: [it] });
      } else {
        last.items.push(it);
      }
    }
    return groups;
  });

  protected linkFor(item: NavItem): string[] {
    if (item.path.length === 0) {
      return ['/dashboard'];
    }
    return ['/dashboard', ...item.path];
  }

  protected linkActiveOptions(item: NavItem): { exact: boolean } {
    return { exact: item.path.length === 0 };
  }

  protected logout(): void {
    this.accountOpen.set(false);
    this.session.logout();
    void this.router.navigate(['/auth/login']);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected toggleAccount(): void {
    this.accountOpen.update((v) => !v);
  }

  protected closeAccountOnNavigate(): void {
    this.accountOpen.set(false);
    this.closeSidebar();
  }
}
