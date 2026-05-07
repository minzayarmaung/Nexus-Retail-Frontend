import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ImageUploadService } from '../../core/image-upload/image-upload.service';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import { ShopApiService } from './shop.api';
import type { CreateShopRequest, ShopSummary } from './shop.model';

const SHOP_TYPE_OPTIONS = ['RETAIL', 'WHOLESALE', 'PHARMACY', 'RESTAURANT', 'SERVICE'];
const ADDRESS_TYPE_OPTIONS = ['HEADQUARTER', 'BRANCH', 'BILLING', 'SHIPPING'];

function blankShopDraft(): CreateShopRequest {
  return {
    name: '',
    type: '',
    phoneNo: '',
    shopPhotoUrl: '',
    addresses: [
      {
        address: '',
        addressType: 'HEADQUARTER',
        city: '',
        state: '',
        postalCode: '',
        country: 'Myanmar',
      },
    ],
  };
}

@Component({
  selector: 'app-shop-management',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Stores</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          SYSTEM_ADMIN only: create and manage shops.
        </p>
      </div>

      @if (!isSystemAdmin()) {
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          You do not have permission to manage shops.
        </div>
      } @else {
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="relative flex-1 min-w-48">
            <svg class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input [(ngModel)]="searchQuery" name="search" placeholder="Search stores by name, type, phone…"
              class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500" />
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
              <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Create New Store
            </button>
          </div>
        </div>

        @if (loading()) {
          <p class="text-xs text-indigo-600 dark:text-indigo-400">Loading stores...</p>
        }

        @if (showCreateModal()) {
          <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
            <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" (click)="closeCreateModal()"></div>
            <div class="relative z-10 my-4 w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl max-h-[calc(100vh-2rem)] sm:p-6 dark:border-slate-700 dark:bg-slate-900">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Create Store</h2>
                <button type="button" (click)="closeCreateModal()"
                  class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                  <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/30">
                <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Shop Photo <span class="text-rose-500">*</span>
                </label>
                <div class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  @if (photoPreviewUrl || draft.shopPhotoUrl) {
                    <img [src]="photoPreviewUrl || draft.shopPhotoUrl" alt="Shop photo preview" class="h-48 w-full object-cover sm:h-56" />
                  } @else {
                    <div class="flex h-48 w-full items-center justify-center text-sm text-slate-400 dark:text-slate-500 sm:h-56">
                      No shop photo uploaded
                    </div>
                  }
                </div>
                <div class="mt-3 flex items-center gap-3">
                  <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                    <input type="file" accept="image/*" class="sr-only" [disabled]="saving() || imageProcessing()" (change)="onShopPhotoSelected($event)" />
                    Upload Shop Photo
                  </label>
                  @if (imageProcessing()) {
                    <span class="text-xs text-indigo-600 dark:text-indigo-400">Uploading image...</span>
                  }
                </div>
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <input [(ngModel)]="draft.name" name="name" placeholder="Shop name" class="input-field" />
                <select [(ngModel)]="draft.type" name="type" class="input-field">
                  <option value="">Select shop type</option>
                  @for (type of shopTypeOptions; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
                <input [(ngModel)]="draft.phoneNo" name="phoneNo" placeholder="Phone number" class="input-field sm:col-span-2" />
                <input [(ngModel)]="draft.addresses[0].address" name="address" placeholder="Address" class="input-field sm:col-span-2" />
                <select [(ngModel)]="draft.addresses[0].addressType" name="addressType" class="input-field">
                  @for (type of addressTypeOptions; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
                <input [(ngModel)]="draft.addresses[0].city" name="city" placeholder="City" class="input-field" />
                <input [(ngModel)]="draft.addresses[0].state" name="state" placeholder="State" class="input-field" />
                <input [(ngModel)]="draft.addresses[0].postalCode" name="postalCode" placeholder="Postal code" class="input-field" />
                <input [(ngModel)]="draft.addresses[0].country" name="country" placeholder="Country" class="input-field" />
              </div>

              <div class="mt-5 flex flex-wrap gap-2 justify-end">
                <button type="button" (click)="closeCreateModal()" [disabled]="saving()"
                  class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Cancel
                </button>
                <button type="button" (click)="createShop()" [disabled]="saving() || imageProcessing() || !isValid()"
                  class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60">
                  {{ saving() ? 'Saving…' : 'Create Store' }}
                </button>
              </div>
            </div>
          </div>
        }

        <div class="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:border-slate-700/60 dark:bg-slate-900">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr class="border-b border-slate-200 dark:border-slate-700">
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Store</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden sm:table-cell">Contact</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden md:table-cell">Type</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (shop of filteredShops(); track shop.id) {
                <tr (click)="viewShop(shop)" class="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <img [src]="shop.shopPhotoUrl || fallbackShopPhoto(shop)"
                        alt="{{ shop.name }}"
                        class="size-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        width="36" height="36" />
                      <div>
                        <p class="font-semibold text-slate-900 dark:text-slate-100">{{ shop.name }}</p>
                        <p class="text-xs text-slate-400 sm:hidden">{{ shop.phoneNo || '—' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 hidden sm:table-cell text-slate-700 dark:text-slate-200">
                    {{ shop.phoneNo || '—' }}
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    @if (shop.type) {
                      <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        {{ shop.type }}
                      </span>
                    } @else {
                      <span class="text-slate-400">—</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                    No stores found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (viewingShop()) {
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
                  <img [src]="viewingShop()!.shopPhotoUrl || fallbackShopPhoto(viewingShop()!)"
                    alt="{{ viewingShop()!.name }}"
                    class="size-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900"
                    width="80" height="80" />
                </div>
              </div>
              <div class="px-6 pt-14 pb-6">
                <div class="flex items-start justify-between">
                  <div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ viewingShop()!.name }}</h2>
                    @if (viewingShop()!.type) {
                      <span class="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        {{ viewingShop()!.type }}
                      </span>
                    }
                  </div>
                  <a [routerLink]="['/dashboard/shops', viewingShop()!.id]"
                    class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    Open Detail
                  </a>
                </div>
                <dl class="mt-4 grid grid-cols-1 gap-y-3 sm:grid-cols-2 text-sm">
                  <div class="flex flex-col">
                    <dt class="text-xs text-slate-400">Phone</dt>
                    <dd class="text-slate-700 dark:text-slate-200">{{ viewingShop()!.phoneNo || '—' }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="text-xs text-slate-400">Store ID</dt>
                    <dd class="text-slate-700 dark:text-slate-200">{{ viewingShop()!.id }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        }
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
export class ShopManagementComponent {
  private readonly api = inject(ShopApiService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly imageUpload = inject(ImageUploadService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly imageProcessing = signal(false);
  readonly shops = signal<ShopSummary[]>([]);
  readonly showCreateModal = signal(false);
  readonly viewingShop = signal<ShopSummary | null>(null);
  readonly isSystemAdmin = computed(() => this.session.user()?.role === 'system_admin');
  readonly filteredShops = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.shops();
    return this.shops().filter(s =>
      `${s.name}`.toLowerCase().includes(q)
      || `${s.type ?? ''}`.toLowerCase().includes(q)
      || `${s.phoneNo ?? ''}`.toLowerCase().includes(q));
  });

  draft: CreateShopRequest = blankShopDraft();
  photoPreviewUrl = '';
  searchQuery = '';
  readonly shopTypeOptions = SHOP_TYPE_OPTIONS;
  readonly addressTypeOptions = ADDRESS_TYPE_OPTIONS;

  constructor() {
    void this.reload();
  }

  isValid(): boolean {
    const a = this.draft.addresses[0];
    return !!this.draft.name.trim()
      && !!this.draft.type.trim()
      && !!this.draft.phoneNo.trim()
      && !!this.draft.shopPhotoUrl.trim()
      && !!a?.address?.trim()
      && !!a?.addressType?.trim()
      && !!a?.city?.trim()
      && !!a?.state?.trim()
      && !!a?.postalCode?.trim()
      && !!a?.country?.trim();
  }

  resetDraft(): void {
    this.revokePhotoPreviewUrl();
    this.draft = blankShopDraft();
  }

  openCreateModal(): void {
    this.resetDraft();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.resetDraft();
  }

  async createShop(): Promise<void> {
    if (!this.isSystemAdmin() || !this.isValid()) return;
    this.saving.set(true);
    try {
      const created = await this.api.create({
        ...this.draft,
        name: this.draft.name.trim(),
        type: this.draft.type.trim(),
        phoneNo: this.draft.phoneNo.trim(),
        shopPhotoUrl: this.draft.shopPhotoUrl.trim(),
        addresses: this.draft.addresses.map(a => ({
          ...a,
          address: a.address.trim(),
          addressType: a.addressType.trim(),
          city: a.city.trim(),
          state: a.state.trim(),
          postalCode: a.postalCode.trim(),
          country: a.country.trim(),
        })),
      });
      this.toast.success('Shop created');
      this.closeCreateModal();
      await this.reload();
      if (created?.id) this.viewingShop.set(created);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to create shop');
    } finally {
      this.saving.set(false);
    }
  }

  onShopPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.setPhotoPreviewUrl(URL.createObjectURL(file));
    this.draft.shopPhotoUrl = '';
    this.imageProcessing.set(true);
    void this.imageUpload
      .uploadPublicImage(file)
      .then(url => {
        this.draft.shopPhotoUrl = url;
        this.revokePhotoPreviewUrl();
      })
      .catch(e => {
        this.toast.error(e instanceof Error ? e.message : 'Failed to upload image');
        this.draft.shopPhotoUrl = '';
        this.revokePhotoPreviewUrl();
      })
      .finally(() => this.imageProcessing.set(false));
    (event.target as HTMLInputElement).value = '';
  }

  viewShop(shop: ShopSummary): void {
    this.viewingShop.set(shop);
  }

  closeView(): void {
    this.viewingShop.set(null);
  }

  importExcel(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.toast.success(`"${file.name}" ready to import (backend integration pending)`);
    (event.target as HTMLInputElement).value = '';
  }

  exportExcel(): void {
    const rows = [
      ['ID', 'Name', 'Type', 'Phone'],
      ...this.filteredShops().map(s => [s.id, s.name, s.type ?? '', s.phoneNo ?? '']),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stores_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Exported as CSV');
  }

  private async reload(): Promise<void> {
    if (!this.isSystemAdmin()) return;
    this.loading.set(true);
    try {
      this.shops.set(await this.api.list());
    } catch {
      this.shops.set([]);
    } finally {
      this.loading.set(false);
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

  fallbackShopPhoto(shop: ShopSummary): string {
    const encoded = encodeURIComponent(shop.name || 'Store');
    return `https://ui-avatars.com/api/?name=${encoded}&background=4f46e5&color=fff&rounded=true&size=64`;
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.viewingShop()) this.closeView();
    else if (this.showCreateModal()) this.closeCreateModal();
  }
}
