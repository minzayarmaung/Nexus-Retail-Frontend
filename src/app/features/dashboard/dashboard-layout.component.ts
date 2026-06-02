import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LanguageSwitcherComponent } from '../../i18n/language-switcher.component';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { NAV_BY_ROLE, type NavItem } from '../../core/navigation/nav.config';
import { avatarDataUrl, resolveAvatarId } from '../../core/user/avatars';
import { SessionService } from '../../core/user/session.service';
import { NavIconComponent } from './nav-icon.component';
import { PasswordInputComponent } from '../../shared/form/password-input.component';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    TranslatePipe,
    LanguageSwitcherComponent,
    NavIconComponent,
    PasswordInputComponent,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly sidebarOpen = signal(false);
  protected readonly accountOpen = signal(false);
  protected readonly avatarUrl = (id: string) => avatarDataUrl(resolveAvatarId(id));
  protected readonly changingPassword = signal(false);
  protected readonly passwordChangeError = signal<string | null>(null);
  protected newPassword = '';
  protected confirmPassword = '';
  protected readonly passwordsMismatch = computed(() => {
    const newPassword = this.newPassword.trim();
    const confirmPassword = this.confirmPassword.trim();
    return !!newPassword && !!confirmPassword && newPassword !== confirmPassword;
  });

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

  protected hubLinkFor(item: NavItem): string[] {
    return this.linkFor(item);
  }

  protected linkFor(item: NavItem): string[] {
    if (item.path.length === 0) {
      return ['/dashboard'];
    }
    return ['/dashboard', ...item.path];
  }

  protected hubLinkActiveOptions(item: NavItem): { exact: boolean } {
    if (item.children?.length) {
      return { exact: false };
    }
    return this.linkActiveOptions(item);
  }

  protected linkActiveOptions(item: NavItem): { exact: boolean } {
    return { exact: item.path.length === 0 };
  }

  protected async logout(): Promise<void> {
    this.accountOpen.set(false);
    await this.session.logout();
    await this.router.navigate(['/system/auth/login']);
  }

  protected async submitForcedPasswordChange(): Promise<void> {
    const newPassword = this.newPassword.trim();
    const confirmPassword = this.confirmPassword.trim();
    this.passwordChangeError.set(null);

    if (!newPassword || !confirmPassword) {
      this.passwordChangeError.set('Password and confirm password are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.passwordChangeError.set('Passwords do not match');
      return;
    }
    if (this.changingPassword()) {
      return;
    }

    this.changingPassword.set(true);
    try {
      await this.session.changeOwnPassword(newPassword);
      this.newPassword = '';
      this.confirmPassword = '';
      this.passwordChangeError.set(null);
      this.toast.success('Password changed successfully');
    } catch (e) {
      this.passwordChangeError.set(this.extractErrorMessage(e));
    } finally {
      this.changingPassword.set(false);
    }
  }

  protected onPasswordInput(): void {
    if (this.passwordChangeError()) {
      this.passwordChangeError.set(null);
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      if (payload && typeof payload === 'object') {
        const message = (payload as Record<string, unknown>)['message'];
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
    }
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return 'Could not change password';
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
