import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageUploadService } from '../../core/image-upload/image-upload.service';
import { PasswordInputComponent } from '../../shared/form/password-input.component';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import { ShopOwnerApiService } from '../shop-owner/shop-owner.api';
import type { CreateShopOwnerRequest, ShopOption, UserListItem } from '../shop-owner/shop-owner.model';

function blankDraft(): Partial<CreateShopOwnerRequest> {
  return {
    username: '',
    name: '',
    profileUrl: '',
    email: '',
    password: '',
    phoneNo: '',
    shopId: undefined,
  };
}

@Component({
  selector: 'app-users-management',
  imports: [FormsModule, PasswordInputComponent],
  template: `
<div class="space-y-5">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Users</h1>
      <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">SYSTEM_ADMIN can create merchant owners.</p>
    </div>
    <div class="flex flex-wrap items-center gap-2 justify-end">
      <label class="relative cursor-pointer">
        <input type="file" accept=".xlsx,.xls,.csv" class="sr-only" (change)="importExcel($event)" />
        <span class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          <svg class="size-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 12V4m0 0L8 8m4-4 4 4"/>
          </svg>
          Import
        </span>
      </label>
      <button type="button" (click)="exportExcel()"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
        <svg class="size-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0 4-4m-4 4-4-4"/>
        </svg>
        Export
      </button>
      <button type="button" (click)="openCreateModal()"
        class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
        Create User
      </button>
    </div>
  </div>

  @if (!isSystemAdmin()) {
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
      You do not have permission to view users.
    </div>
  } @else {
  <div class="relative flex-1 min-w-48">
    <svg class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
    </svg>
    <input [(ngModel)]="searchQuery" name="search" placeholder="Search username, name, email, phone…"
      class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500" />
  </div>
  @if (loadingUsers()) {
    <p class="text-xs text-indigo-600 dark:text-indigo-400">Loading users...</p>
  }

  <div class="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:border-slate-700/60 dark:bg-slate-900">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50 dark:bg-slate-800/50">
        <tr class="border-b border-slate-200 dark:border-slate-700">
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">User</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden sm:table-cell">Contact</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden md:table-cell">Shop</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        @for (u of filteredUsers(); track u.id) {
        <tr (click)="viewUser(u)" class="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img [src]="u.profileUrl || fallbackAvatar(u)"
                alt="{{ u.name }}"
                class="size-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                width="36" height="36" />
              <div>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ u.name }}</p>
                <p class="text-xs text-slate-400">@{{ u.username }}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 hidden sm:table-cell">
            <p class="text-slate-700 dark:text-slate-200">{{ u.email || '—' }}</p>
            <p class="text-xs text-slate-400">{{ u.phoneNo || '—' }}</p>
          </td>
          <td class="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
            {{ u.shopName || (u.shopId ? ('Shop #' + u.shopId) : '—') }}
          </td>
        </tr>
        } @empty {
        <tr>
          <td colspan="3" class="px-4 py-12 text-center text-slate-400 dark:text-slate-500">No users found.</td>
        </tr>
        }
      </tbody>
    </table>
  </div>
  }

  @if (showCreateModal() && isSystemAdmin()) {
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" (click)="closeCreateModal()"></div>
    <div class="relative z-10 my-4 w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl max-h-[calc(100vh-2rem)] sm:p-6 dark:border-slate-700 dark:bg-slate-900">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Create User</h2>
        <button type="button" (click)="closeCreateModal()"
          class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="mt-2 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/30">
          <div class="flex flex-col items-center gap-2">
            <div class="size-20 rounded-full ring-2 ring-indigo-200 dark:ring-indigo-900 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              <img [src]="photoPreviewUrl || draft.profileUrl || fallbackDraftAvatar()"
                alt="Profile"
                class="size-20 object-cover" width="80" height="80" />
            </div>
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Profile Photo</label>
            <label class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <input type="file" accept="image/*" class="sr-only" [disabled]="saving() || imageProcessing()" (change)="onProfilePhotoSelected($event)" />
              Upload
            </label>
            @if (imageProcessing()) {
              <span class="text-xs text-indigo-600 dark:text-indigo-400">Uploading...</span>
            }
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Username <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.username" name="username" placeholder="Username" class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Name <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.name" name="name" placeholder="Name" class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Email <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.email" name="email" placeholder="Email" type="email" class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Phone <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.phoneNo" name="phoneNo" placeholder="(+959)422659650" (blur)="normalizePhone()" class="input-field" />
          @if (phoneValidationMessage()) {
            <p class="text-xs text-rose-600 dark:text-rose-400">{{ phoneValidationMessage() }}</p>
          }
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Password <span class="text-rose-500">*</span></label>
          <app-password-input
            [(ngModel)]="draft.password"
            name="password"
            placeholder="Password"
            autocomplete="new-password"
            [inputClass]="'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder-slate-500'"
          />
          @if (passwordValidationMessage()) {
            <p class="text-xs text-rose-600 dark:text-rose-400">{{ passwordValidationMessage() }}</p>
          }
          @if (passwordStrengthLabel()) {
            <p class="text-xs"
              [class.text-rose-600]="passwordStrengthLabel() === 'Weak'"
              [class.dark:text-rose-400]="passwordStrengthLabel() === 'Weak'"
              [class.text-amber-600]="passwordStrengthLabel() === 'Normal'"
              [class.dark:text-amber-400]="passwordStrengthLabel() === 'Normal'"
              [class.text-emerald-600]="passwordStrengthLabel() === 'Strong'"
              [class.dark:text-emerald-400]="passwordStrengthLabel() === 'Strong'">
              Strength: {{ passwordStrengthLabel() }}
            </p>
          }
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Confirm Password <span class="text-rose-500">*</span></label>
          <app-password-input
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm password"
            autocomplete="new-password"
            [inputClass]="'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder-slate-500'"
          />
          @if (confirmPassword && confirmPassword !== (draft.password ?? '')) {
            <p class="text-xs text-rose-600 dark:text-rose-400">Passwords do not match.</p>
          }
        </div>
        <div class="relative flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Shop <span class="text-rose-500">*</span></label>
          <button type="button" (click)="toggleShopDropdown()" class="input-field flex items-center justify-between text-left">
            <span class="truncate">{{ selectedShopLabel() }}</span>
            <svg class="size-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          @if (shopDropdownOpen()) {
            <div class="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <input
                [(ngModel)]="shopSearchQuery"
                (ngModelChange)="onShopSearchChanged()"
                name="shopSearchInDropdown"
                placeholder="Search shop..."
                class="input-field mb-2" />
              <div class="max-h-44 overflow-y-auto">
                @for (shop of availableShops(); track shop.id) {
                  <button
                    type="button"
                    (click)="selectShop(shop)"
                    class="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    <span class="truncate">{{ shop.name }}</span>
                    @if (draft.shopId === shop.id) {
                      <svg class="size-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    }
                  </button>
                } @empty {
                  <p class="px-2 py-2 text-xs text-slate-400">No shops found.</p>
                }
              </div>
            </div>
          }
        </div>
      </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2 justify-end">
        <button type="button" (click)="closeCreateModal()" [disabled]="saving()"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Cancel
        </button>
        <button type="button" (click)="createUser()" [disabled]="saving() || imageProcessing() || !isValidDraft()"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60">
          {{ saving() ? 'Saving…' : 'Create User' }}
        </button>
      </div>
    </div>
  </div>
  }

  @if (viewingUser()) {
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" (click)="closeView()"></div>
    <div class="relative z-10 my-4 w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[calc(100vh-2rem)] dark:border-slate-700 dark:bg-slate-900">
      <div class="relative h-28 rounded-t-2xl bg-gradient-to-r from-indigo-600 to-violet-600">
        <button type="button" (click)="closeView()"
          class="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition">
          <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div class="absolute -bottom-10 left-6">
          <img [src]="viewingUser()!.profileUrl || fallbackAvatar(viewingUser()!)"
            alt="{{ viewingUser()!.name }}"
            class="size-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900"
            width="80" height="80" />
        </div>
      </div>
      <div class="px-6 pt-14 pb-6">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ viewingUser()!.name }}</h2>
        <p class="text-xs text-slate-400">@{{ viewingUser()!.username }}</p>
        <dl class="mt-4 grid grid-cols-1 gap-y-3 sm:grid-cols-2 text-sm">
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Email</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingUser()!.email || '—' }}</dd>
          </div>
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Phone</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingUser()!.phoneNo || '—' }}</dd>
          </div>
          <div class="flex flex-col sm:col-span-2">
            <dt class="text-xs text-slate-400">Shop</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingUser()!.shopName || (viewingUser()!.shopId ? ('Shop #' + viewingUser()!.shopId) : '—') }}</dd>
          </div>
        </dl>
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
  readonly availableShops = signal<ShopOption[]>([]);
  readonly loadingUsers = signal(false);
  readonly loadingShops = signal(false);
  readonly saving = signal(false);
  readonly imageProcessing = signal(false);
  readonly showCreateModal = signal(false);
  readonly viewingUser = signal<UserListItem | null>(null);
  readonly shopDropdownOpen = signal(false);
  readonly isSystemAdmin = computed(() => this.session.user()?.role === 'system_admin');
  readonly filteredUsers = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(u =>
      `${u.username}`.toLowerCase().includes(q)
      || `${u.name}`.toLowerCase().includes(q)
      || `${u.email ?? ''}`.toLowerCase().includes(q)
      || `${u.phoneNo ?? ''}`.toLowerCase().includes(q));
  });

  searchQuery = '';
  shopSearchQuery = '';
  confirmPassword = '';
  draft: Partial<CreateShopOwnerRequest> = blankDraft();
  photoPreviewUrl = '';

  constructor() {
    void this.reloadUsers();
  }

  isValidDraft(): boolean {
    const profileUrl = this.draft.profileUrl?.trim() ?? '';
    const phone = this.draft.phoneNo?.trim() ?? '';
    return !!this.draft.username?.trim()
      && !!this.draft.name?.trim()
      && !!this.draft.email?.trim()
      && profileUrl.length >= 0
      && !!this.draft.password?.trim()
      && (this.draft.password?.trim().length ?? 0) >= 8
      && this.confirmPassword === this.draft.password
      && !!phone
      && this.isValidPhone(phone)
      && !!this.draft.shopId;
  }

  openCreateModal(): void {
    this.resetDraft();
    this.showCreateModal.set(true);
    void this.loadShops();
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.shopDropdownOpen.set(false);
    this.resetDraft();
  }

  async createUser(): Promise<void> {
    if (!this.isSystemAdmin() || !this.isValidDraft()) return;
    this.saving.set(true);
    try {
      this.normalizePhone();
      await this.api.createOwner({
        username: this.draft.username!.trim(),
        name: this.draft.name!.trim(),
        profileUrl: this.draft.profileUrl?.trim() ?? '',
        email: this.draft.email!.trim(),
        password: this.draft.password!,
        phoneNo: this.draft.phoneNo!.trim(),
        shopId: Number(this.draft.shopId),
      });
      this.toast.success('User created');
      this.closeCreateModal();
      await this.reloadUsers();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to create user');
    } finally {
      this.saving.set(false);
    }
  }

  async onShopSearchChanged(): Promise<void> {
    await this.loadShops(this.shopSearchQuery);
  }

  toggleShopDropdown(): void {
    const next = !this.shopDropdownOpen();
    this.shopDropdownOpen.set(next);
    if (next && this.availableShops().length === 0) void this.loadShops();
  }

  selectShop(shop: ShopOption): void {
    this.draft.shopId = shop.id;
    this.shopDropdownOpen.set(false);
  }

  selectedShopLabel(): string {
    const selected = this.availableShops().find(s => s.id === Number(this.draft.shopId));
    return selected?.name ?? 'Select shop';
  }

  onProfilePhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.setPhotoPreviewUrl(URL.createObjectURL(file));
    this.draft.profileUrl = '';
    this.imageProcessing.set(true);
    void this.imageUpload.uploadPublicImage(file)
      .then(url => {
        this.draft.profileUrl = url;
        this.revokePhotoPreviewUrl();
      })
      .catch(e => {
        this.toast.error(e instanceof Error ? e.message : 'Failed to upload image');
        this.draft.profileUrl = '';
        this.revokePhotoPreviewUrl();
      })
      .finally(() => this.imageProcessing.set(false));
    (event.target as HTMLInputElement).value = '';
  }

  viewUser(user: UserListItem): void {
    this.viewingUser.set(user);
  }

  closeView(): void {
    this.viewingUser.set(null);
  }

  importExcel(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.toast.success(`"${file.name}" ready to import (backend integration pending)`);
    (event.target as HTMLInputElement).value = '';
  }

  exportExcel(): void {
    const rows = [
      ['ID', 'Username', 'Name', 'Email', 'Phone', 'Shop ID', 'Shop Name'],
      ...this.filteredUsers().map(u => [u.id, u.username, u.name, u.email ?? '', u.phoneNo ?? '', u.shopId ?? '', u.shopName ?? '']),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Exported as CSV');
  }

  fallbackAvatar(u: UserListItem): string {
    const encoded = encodeURIComponent(u.name || u.username || 'User');
    return `https://ui-avatars.com/api/?name=${encoded}&background=4f46e5&color=fff&rounded=true&size=64`;
  }

  fallbackDraftAvatar(): string {
    const encoded = encodeURIComponent((this.draft.name ?? '').trim() || (this.draft.username ?? '').trim() || 'User');
    return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&rounded=true&size=64`;
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.viewingUser()) this.closeView();
    else if (this.showCreateModal()) this.closeCreateModal();
  }

  normalizePhone(): void {
    const raw = (this.draft.phoneNo ?? '').trim();
    if (!raw) return;
    const digits = raw.replace(/\D/g, '');
    const local = digits.startsWith('959')
      ? digits.slice(3)
      : digits.startsWith('09')
        ? digits.slice(1)
        : digits.startsWith('95')
          ? digits.slice(2)
          : digits.startsWith('9')
            ? digits.slice(1)
            : digits;
    this.draft.phoneNo = local ? `(+959)${local.slice(0, 9)}` : '';
  }

  phoneValidationMessage(): string {
    const raw = (this.draft.phoneNo ?? '').trim();
    if (!raw) return '';
    if (!this.isValidPhone(raw)) return 'Phone must be (+959) followed by up to 9 digits.';
    return '';
  }

  passwordValidationMessage(): string {
    const pwd = (this.draft.password ?? '').trim();
    if (!pwd) return '';
    if (pwd.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }

  passwordStrengthLabel(): 'Weak' | 'Normal' | 'Strong' | '' {
    const pwd = (this.draft.password ?? '').trim();
    if (!pwd) return '';
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    const score = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
    if (pwd.length >= 12 && score >= 3) return 'Strong';
    if (pwd.length >= 8 && score >= 2) return 'Normal';
    return 'Weak';
  }

  private isValidPhone(input?: string): boolean {
    const value = (input ?? '').trim();
    if (!value) return false;
    return /^\(\+959\)\d{1,9}$/.test(value);
  }

  private resetDraft(): void {
    this.revokePhotoPreviewUrl();
    this.shopSearchQuery = '';
    this.confirmPassword = '';
    this.draft = blankDraft();
  }

  private async reloadUsers(): Promise<void> {
    if (!this.isSystemAdmin()) return;
    this.loadingUsers.set(true);
    try {
      this.users.set(await this.api.listUsers());
    } catch {
      this.users.set([]);
    } finally {
      this.loadingUsers.set(false);
    }
  }

  private async loadShops(query?: string): Promise<void> {
    this.loadingShops.set(true);
    try {
      const list = query?.trim() ? await this.api.searchShops(query) : await this.api.listShops();
      this.availableShops.set(list);
      const selectedShopId = Number(this.draft.shopId);
      if (!Number.isFinite(selectedShopId) || !list.some(s => s.id === selectedShopId)) this.draft.shopId = undefined;
    } catch {
      this.availableShops.set([]);
    } finally {
      this.loadingShops.set(false);
    }
  }

  private setPhotoPreviewUrl(url: string): void {
    this.revokePhotoPreviewUrl();
    this.photoPreviewUrl = url;
  }

  private revokePhotoPreviewUrl(): void {
    if (this.photoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(this.photoPreviewUrl);
    this.photoPreviewUrl = '';
  }
}
