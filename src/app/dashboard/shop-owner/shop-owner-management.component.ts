import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageUploadService } from '../../core/image-upload/image-upload.service';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import { ShopOwnerApiService } from './shop-owner.api';
import type { CreateShopOwnerRequest, ShopOption } from './shop-owner.model';

@Component({
  selector: 'app-shop-owner-management',
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Create Shop Owner</h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
          SYSTEM_ADMIN only: create owner user and assign a shop.
        </p>
      </div>

      @if (!isSystemAdmin()) {
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          You do not have permission to create shop owners.
        </div>
      } @else {
        <section class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
          <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/30">
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Shop Photo <span class="text-rose-500">*</span>
            </label>
            <div class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              @if (photoPreviewUrl || draft.profileUrl) {
                <img [src]="photoPreviewUrl || draft.profileUrl" alt="Shop photo preview" class="h-48 w-full object-cover sm:h-56" />
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

          <div class="grid gap-3 sm:grid-cols-2">
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.username" name="username" placeholder="Username" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.name" name="name" placeholder="Name" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.email" name="email" placeholder="Email" type="email" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.password" name="password" placeholder="Password" type="password" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.phoneNo" name="phoneNo" placeholder="Phone number" />
            <div class="sm:col-span-2 grid gap-2">
              <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                [(ngModel)]="shopSearchQuery" (ngModelChange)="onShopSearchChanged()"
                name="shopSearchQuery" placeholder="Search shop by name" />
              <select class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                [(ngModel)]="draft.shopId" name="shopId">
                <option [ngValue]="undefined">Select shop</option>
                @for (shop of availableShops(); track shop.id) {
                  <option [ngValue]="shop.id">{{ shop.name }} (ID: {{ shop.id }})</option>
                }
              </select>
              @if (loadingShops()) {
                <p class="text-xs text-indigo-600 dark:text-indigo-400">Loading shops...</p>
              }
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <button type="button" (click)="create()" [disabled]="saving() || !isValid()"
              class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">
              Create Owner
            </button>
            <button type="button" (click)="reset()" [disabled]="saving()"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Reset
            </button>
          </div>
        </section>
      }
    </div>
  `
})
export class ShopOwnerManagementComponent {
  private readonly api = inject(ShopOwnerApiService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly imageUpload = inject(ImageUploadService);

  readonly saving = signal(false);
  readonly imageProcessing = signal(false);
  readonly loadingShops = signal(false);
  readonly isSystemAdmin = computed(() => this.session.user()?.role === 'system_admin');
  readonly availableShops = signal<ShopOption[]>([]);
  photoPreviewUrl = '';
  shopSearchQuery = '';

  draft: Partial<CreateShopOwnerRequest> = {
    username: '',
    name: '',
    profileUrl: '',
    email: '',
    password: '',
    phoneNo: '',
    shopId: undefined
  };

  constructor() {
    void this.loadShops();
  }

  isValid(): boolean {
    return !!this.draft.username?.trim()
      && !!this.draft.name?.trim()
      && !!this.draft.profileUrl?.trim()
      && !!this.draft.email?.trim()
      && !!this.draft.password?.trim()
      && !!this.draft.phoneNo?.trim()
      && !!this.draft.shopId;
  }

  reset(): void {
    this.revokePhotoPreviewUrl();
    this.draft = {
      username: '',
      name: '',
      profileUrl: '',
      email: '',
      password: '',
      phoneNo: '',
      shopId: undefined
    };
  }

  async create(): Promise<void> {
    if (!this.isSystemAdmin() || !this.isValid()) return;
    this.saving.set(true);
    try {
      await this.api.createOwner({
        username: this.draft.username!.trim(),
        name: this.draft.name!.trim(),
        profileUrl: this.draft.profileUrl!.trim(),
        email: this.draft.email!.trim(),
        password: this.draft.password!,
        phoneNo: this.draft.phoneNo!.trim(),
        shopId: Number(this.draft.shopId)
      });
      this.toast.success('Shop owner created');
      this.reset();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to create shop owner');
    } finally {
      this.saving.set(false);
    }
  }

  async onShopSearchChanged(): Promise<void> {
    await this.loadShops(this.shopSearchQuery);
  }

  onShopPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.setPhotoPreviewUrl(URL.createObjectURL(file));
    this.draft.profileUrl = '';
    this.imageProcessing.set(true);
    void this.imageUpload
      .uploadPublicImage(file)
      .then(url => {
        this.draft.profileUrl = url;
        this.revokePhotoPreviewUrl();
      })
      .catch(e => {
        this.toast.error(e instanceof Error ? e.message : 'Failed to upload image');
        this.draft.profileUrl = '';
        this.revokePhotoPreviewUrl();
      })
      .finally(() => {
        this.imageProcessing.set(false);
      });
    (event.target as HTMLInputElement).value = '';
  }

  private setPhotoPreviewUrl(url: string): void {
    this.revokePhotoPreviewUrl();
    this.photoPreviewUrl = url;
  }

  private revokePhotoPreviewUrl(): void {
    if (this.photoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
    this.photoPreviewUrl = '';
  }

  private async loadShops(query?: string): Promise<void> {
    if (!this.isSystemAdmin()) return;
    this.loadingShops.set(true);
    try {
      const list = query?.trim()
        ? await this.api.searchShops(query)
        : await this.api.listShops();
      this.availableShops.set(list);

      const selectedShopId = Number(this.draft.shopId);
      if (!Number.isFinite(selectedShopId) || !list.some(s => s.id === selectedShopId)) {
        this.draft.shopId = undefined;
      }
    } catch (e) {
      this.availableShops.set([]);
      this.toast.error(e instanceof Error ? e.message : 'Failed to load shops');
    } finally {
      this.loadingShops.set(false);
    }
  }
}

