import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageUploadService } from '../../core/image-upload/image-upload.service';
import { PasswordInputComponent } from '../../shared/form/password-input.component';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import { ShopOwnerApiService } from '../shop-owner/shop-owner.api';
import type { CreateShopOwnerRequest, ShopOption, UserListItem } from '../shop-owner/shop-owner.model';

function blankDraft(): Partial<CreateShopOwnerRequest> {
  return { username: '', name: '', profileUrl: '', email: '', password: '', phoneNo: '', shopId: undefined };
}

@Component({
  selector: 'app-users-management',
  imports: [FormsModule, PasswordInputComponent],
  template: `
<div class="space-y-5">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Users</h1>
      <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">SYSTEM_ADMIN can create and edit users.</p>
    </div>
    <div class="flex flex-wrap items-center gap-2 justify-end">
      <button type="button" (click)="openCreateModal()"
        class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
        Create User
      </button>
    </div>
  </div>

  <div class="relative flex-1 min-w-48">
    <svg class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
    </svg>
    <input [(ngModel)]="searchQuery" name="search" placeholder="Search id, username, email, phone, role…"
      class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500" />
  </div>

  <div class="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:border-slate-700/60 dark:bg-slate-900">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50 dark:bg-slate-800/50">
        <tr class="border-b border-slate-200 dark:border-slate-700">
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">ID</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Username</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        @for (u of filteredUsers(); track u.id) {
        <tr (click)="editUser(u)" class="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="px-4 py-3 text-slate-700 dark:text-slate-200">{{ u.id }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <img [src]="u.profileUrl || defaultProfileUrl"
                alt="{{ u.username }}"
                class="size-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                width="28" height="28" />
              <span class="font-semibold text-slate-900 dark:text-slate-100">{{ u.username }}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-700 dark:text-slate-200">{{ u.email || '—' }}</td>
          <td class="px-4 py-3 text-slate-700 dark:text-slate-200">{{ u.phoneNo || '—' }}</td>
          <td class="px-4 py-3 text-slate-700 dark:text-slate-200">{{ u.role || '—' }}</td>
        </tr>
        } @empty {
          <tr><td colspan="5" class="px-4 py-12 text-center text-slate-400 dark:text-slate-500">No users found.</td></tr>
        }
      </tbody>
    </table>
  </div>

  @if (showFormModal()) {
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" (click)="closeFormModal()"></div>
    <div class="relative z-10 my-4 w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl max-h-[calc(100vh-2rem)] sm:p-6 dark:border-slate-700 dark:bg-slate-900">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ isEditing() ? 'Edit User' : 'Create User' }}</h2>
        <button type="button" (click)="closeFormModal()" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">×</button>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <input [(ngModel)]="draft.username" name="username" placeholder="Username" class="input-field" />
        <input [(ngModel)]="draft.name" name="name" placeholder="Name" class="input-field" />
        <input [(ngModel)]="draft.email" name="email" placeholder="Email" type="email" class="input-field" />
        <input [(ngModel)]="draft.phoneNo" name="phoneNo" placeholder="Phone" class="input-field" />
        @if (isEditing()) {
          <input [(ngModel)]="draftRole" name="role" placeholder="Role" class="input-field" />
        } @else {
          <app-password-input [(ngModel)]="draft.password" name="password" placeholder="Password" autocomplete="new-password"
            [inputClass]="'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder-slate-500'" />
          <app-password-input [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirm password" autocomplete="new-password"
            [inputClass]="'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder-slate-500'" />
        }
      </div>

      <div class="mt-5 flex flex-wrap gap-2 justify-end">
        <button type="button" (click)="closeFormModal()" class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">Cancel</button>
        <button type="button" (click)="saveUser()" [disabled]="saving() || !isValidDraft()" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          {{ saving() ? 'Saving…' : (isEditing() ? 'Update User' : 'Create User') }}
        </button>
      </div>
    </div>
  </div>
  }
</div>
<style>
  @reference "../../../styles.css";
  .input-field {
    @apply w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm
           focus:outline-none focus:ring-2 focus:ring-indigo-500/40
           dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder-slate-500;
  }
</style>
  `,
})
export class UsersManagementComponent {
  private readonly api = inject(ShopOwnerApiService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly imageUpload = inject(ImageUploadService);

  readonly users = signal<UserListItem[]>([]);
  readonly saving = signal(false);
  readonly showFormModal = signal(false);
  readonly isEditing = signal(false);
  readonly editingUserId = signal<number | null>(null);
  readonly isSystemAdmin = computed(() => this.session.user()?.role === 'system_admin');
  readonly filteredUsers = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(u =>
      `${u.id}`.includes(q) || `${u.username}`.toLowerCase().includes(q) || `${u.email ?? ''}`.toLowerCase().includes(q) || `${u.phoneNo ?? ''}`.toLowerCase().includes(q) || `${u.role ?? ''}`.toLowerCase().includes(q));
  });

  searchQuery = '';
  confirmPassword = '';
  draftRole = '';
  draft: Partial<CreateShopOwnerRequest> = blankDraft();
  readonly defaultProfileUrl = 'https://ui-avatars.com/api/?name=User&background=e2e8f0&color=334155&rounded=true&size=64';

  constructor() {
    void this.reloadUsers();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingUserId.set(null);
    this.confirmPassword = '';
    this.draftRole = '';
    this.draft = blankDraft();
    this.showFormModal.set(true);
  }

  editUser(user: UserListItem): void {
    this.isEditing.set(true);
    this.editingUserId.set(user.id);
    this.confirmPassword = '';
    this.draftRole = user.role ?? '';
    this.draft = { username: user.username, name: user.name ?? user.username, email: user.email ?? '', phoneNo: user.phoneNo ?? '', profileUrl: user.profileUrl ?? '', shopId: user.shopId };
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  isValidDraft(): boolean {
    if (!this.draft.username?.trim() || !this.draft.email?.trim()) return false;
    if (this.isEditing()) return true;
    return !!this.draft.password?.trim() && this.draft.password.trim().length >= 8 && this.confirmPassword === this.draft.password && !!this.draft.shopId;
  }

  async saveUser(): Promise<void> {
    if (!this.isValidDraft()) return;
    this.saving.set(true);
    try {
      if (this.isEditing() && this.editingUserId()) {
        await this.api.updateUser(this.editingUserId()!, {
          username: this.draft.username!.trim(),
          name: this.draft.name?.trim() ?? this.draft.username!.trim(),
          email: this.draft.email!.trim(),
          phoneNo: this.draft.phoneNo?.trim() ?? '',
          role: this.draftRole?.trim() || undefined,
          profileUrl: this.draft.profileUrl?.trim() ?? '',
        });
        this.toast.success('User updated');
      } else {
        await this.api.createOwner({
          username: this.draft.username!.trim(),
          name: this.draft.name?.trim() ?? this.draft.username!.trim(),
          profileUrl: this.draft.profileUrl?.trim() ?? '',
          email: this.draft.email!.trim(),
          password: this.draft.password!,
          phoneNo: this.draft.phoneNo?.trim() ?? '',
          shopId: Number(this.draft.shopId),
        });
        this.toast.success('User created');
      }
      this.closeFormModal();
      await this.reloadUsers();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to save user');
    } finally {
      this.saving.set(false);
    }
  }

  private async reloadUsers(): Promise<void> {
    try {
      this.users.set(await this.api.listUsers());
    } catch (e) {
      this.users.set([]);
      this.toast.error(e instanceof Error ? e.message : 'Failed to load users');
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.showFormModal()) this.closeFormModal();
  }
}
