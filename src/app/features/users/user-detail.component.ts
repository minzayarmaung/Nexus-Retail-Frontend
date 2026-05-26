import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PasswordInputComponent } from '../../shared/form/password-input.component';
import { ToastService } from '../../core/toast/toast.service';
import { assessPasswordStrength } from './password-strength.util';
import { formatRolesList } from './role-display.util';
import type { UserListItem } from './users.model';
import { UsersService } from './users.service';

@Component({
  selector: 'app-user-detail',
  imports: [FormsModule, PasswordInputComponent],
  template: `
    <div class="mx-auto max-w-3xl space-y-6">
      @if (loading()) {
        <p class="py-16 text-center text-sm text-slate-600 dark:text-slate-400">Loading user…</p>
      } @else if (error()) {
        <div
          class="rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
        >
          {{ error() }}
        </div>
        <div class="flex justify-center pt-4">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-600"
            (click)="goBack()"
          >
            Back
          </button>
        </div>
      } @else if (user(); as u) {
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            (click)="edit()"
          >
            Edit
          </button>
          <button
            type="button"
            class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
            (click)="confirmSuspendOpen.set(true)"
          >
            Suspend
          </button>
          <button
            type="button"
            class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
            (click)="confirmDeleteOpen.set(true)"
          >
            Delete
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
            (click)="passwordModalOpen.set(true)"
          >
            Change Password
          </button>
        </div>

        <div class="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
          <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">User details</h1>
          <dl class="mt-8 space-y-5 text-sm">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Username</dt>
              <dd class="mt-1 text-base text-slate-900 dark:text-slate-100">{{ u.username }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">First Name</dt>
              <dd class="mt-1 text-base text-slate-900 dark:text-slate-100">{{ u.firstName || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Name</dt>
              <dd class="mt-1 text-base text-slate-900 dark:text-slate-100">{{ u.lastName || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
              <dd class="mt-1 text-base text-slate-900 dark:text-slate-100">{{ u.email || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Roles</dt>
              <dd class="mt-1 text-base text-slate-900 dark:text-slate-100">{{ formatRoles(u.roles) }}</dd>
            </div>
          </dl>
        </div>

        <div class="flex justify-center pt-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            (click)="goBack()"
          >
            Back
          </button>
        </div>
      }
    </div>

    @if (confirmSuspendOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog">
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Delete user?</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            This will suspend the user account. They will no longer be able to sign in. Continue?
          </p>
          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-600"
              (click)="confirmSuspendOpen.set(false)"
              [disabled]="suspending()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              (click)="suspendUser()"
              [disabled]="suspending()"
            >
              {{ suspending() ? 'Suspending…' : 'Suspend' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (confirmDeleteOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog">
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Delete user?</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            This will <br>DELETE<br> the user account. This action is irreversible. Continue?
          </p>
          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-600"
              (click)="confirmDeleteOpen.set(false)"
              [disabled]="deleting()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              (click)="deleteUser()"
              [disabled]="deleting()"
            >
              {{ deleting() ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (passwordModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog">
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Change password</h2>
          <div class="mt-4 space-y-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <app-password-input
                name="newPassword"
                [(ngModel)]="newPassword"
                autocomplete="new-password"
                placeholder="New password"
              />
              @if (passwordStrength().label) {
                <p class="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Strength: {{ passwordStrength().label }}
                </p>
                <ul class="space-y-0.5 text-xs text-slate-500">
                  @for (c of passwordStrength().checks; track c.label) {
                    <li [class.text-emerald-600]="c.met" [class.dark:text-emerald-400]="c.met">
                      {{ c.met ? '✓' : '○' }} {{ c.label }}
                    </li>
                  }
                </ul>
              }
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</label>
              <app-password-input
                name="confirmPassword"
                [(ngModel)]="confirmPassword"
                autocomplete="new-password"
                placeholder="Confirm password"
              />
              @if (confirmPassword && newPassword !== confirmPassword) {
                <p class="text-xs text-rose-600 dark:text-rose-400">Passwords do not match.</p>
              }
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-600"
              (click)="closePasswordModal()"
              [disabled]="savingPassword()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
              (click)="savePassword()"
              [disabled]="!canSavePassword() || savingPassword()"
            >
              {{ savingPassword() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);

  readonly user = signal<UserListItem | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly confirmDeleteOpen = signal(false);
  readonly confirmSuspendOpen = signal(false);
  readonly deleting = signal(false);
  readonly suspending = signal(false);
  readonly passwordModalOpen = signal(false);
  readonly savingPassword = signal(false);
  newPassword = '';
  confirmPassword = '';

  readonly formatRoles = formatRolesList;

  readonly passwordStrength = computed(() => assessPasswordStrength(this.newPassword));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid user');
      this.loading.set(false);
      return;
    }
    void this.load(id);
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const cached = this.usersService.getCachedUser(id);
    if (cached) {
      this.user.set(cached);
    }
    try {
      const detail = await this.usersService.loadUserDetail(id);
      this.user.set(detail);
    } catch (e) {
      if (!this.user()) {
        this.error.set(e instanceof Error ? e.message : 'Failed to load user');
      }
    } finally {
      this.loading.set(false);
    }
  }

  edit(): void {
    const id = this.user()?.id;
    if (id) void this.router.navigate(['/dashboard', 'users', id, 'edit']);
  }

  goBack(): void {
    void this.router.navigate(['/dashboard', 'users']);
  }

  async suspendUser(): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.suspending.set(true);
    try {
      const msg = await this.usersService.suspendUser(u.id);
      this.toast.success(msg || 'User suspended');
      this.confirmSuspendOpen.set(false);
      void this.router.navigate(['/dashboard', 'users']);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Suspend failed');
    } finally {
      this.suspending.set(false);
    }
  }

  async deleteUser(): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.deleting.set(true);
    try {
      const msg = await this.usersService.deleteUserById(u.id);
      this.toast.success(msg || 'User deleted');
      this.confirmDeleteOpen.set(false);
      void this.router.navigate(['/dashboard', 'users']);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      this.deleting.set(false);
    }
  }

  closePasswordModal(): void {
    this.passwordModalOpen.set(false);
    this.newPassword = '';
    this.confirmPassword = '';
  }

  canSavePassword(): boolean {
    const pwd = this.newPassword.trim();
    const confirm = this.confirmPassword.trim();
    return (
      pwd.length > 0 &&
      pwd === confirm &&
      assessPasswordStrength(pwd).valid
    );
  }

  async savePassword(): Promise<void> {
    const u = this.user();
    if (!u || !this.canSavePassword()) return;
    this.savingPassword.set(true);
    try {
      await this.usersService.changePassword(u.id, this.newPassword.trim());
      this.toast.success('Password updated');
      this.closePasswordModal();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      this.savingPassword.set(false);
    }
  }
}
