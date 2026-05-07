import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImageUploadService } from '../../core/image-upload/image-upload.service';
import { PasswordInputComponent } from '../../shared/form/password-input.component';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import { ShopOwnerApiService } from '../shop-owner/shop-owner.api';
import type { CreateShopOwnerRequest } from '../shop-owner/shop-owner.model';
import { ShopApiService } from './shop.api';
import type { ShopDetail, UpdateShopRequest } from './shop.model';

@Component({
  selector: 'app-shop-detail',
  imports: [FormsModule, RouterLink, PasswordInputComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Shop Detail</h1>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage one tenant and create owner in this shop context.
          </p>
        </div>
        <a [routerLink]="['/dashboard/shops']"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          Back to Shops
        </a>
      </div>

      @if (!isSystemAdmin()) {
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          You do not have permission to manage this page.
        </div>
      } @else if (!shop()) {
        <div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Loading shop detail...
        </div>
      } @else {
        <section class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Shop Information</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="shopDraft.name" name="shopName" placeholder="Shop name" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="shopDraft.type" name="shopType" placeholder="Shop type" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="shopDraft.phoneNo" name="shopPhoneNo" placeholder="Phone number" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="shopDraft.shopPhotoUrl" name="shopPhotoUrl" placeholder="Shop photo URL" />
          </div>
          <div class="mt-4">
            <button type="button" (click)="saveShop()" [disabled]="savingShop()"
              class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">
              Update Shop
            </button>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Create Shop Owner</h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Owner will be created for shop ID: {{ shopId() }}
          </p>

          <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/30">
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Owner Profile Photo <span class="text-rose-500">*</span>
            </label>
            <div class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              @if (photoPreviewUrl || ownerDraft.profileUrl) {
                <img [src]="photoPreviewUrl || ownerDraft.profileUrl" alt="Owner profile preview" class="h-48 w-full object-cover sm:h-56" />
              } @else {
                <div class="flex h-48 w-full items-center justify-center text-sm text-slate-400 dark:text-slate-500 sm:h-56">
                  No profile photo uploaded
                </div>
              }
            </div>
            <div class="mt-3 flex items-center gap-3">
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <input type="file" accept="image/*" class="sr-only" [disabled]="savingOwner() || imageProcessing()" (change)="onOwnerPhotoSelected($event)" />
                Upload Profile Photo
              </label>
              @if (imageProcessing()) {
                <span class="text-xs text-indigo-600 dark:text-indigo-400">Uploading image...</span>
              }
            </div>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="ownerDraft.username" name="username" placeholder="Username" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="ownerDraft.name" name="name" placeholder="Name" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="ownerDraft.email" name="email" placeholder="Email" type="email" />
            <app-password-input
              [(ngModel)]="ownerDraft.password"
              name="password"
              placeholder="Password"
              autocomplete="new-password"
              [inputClass]="'rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm pr-10 dark:border-slate-700 dark:bg-slate-950/40'" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40 sm:col-span-2"
              [(ngModel)]="ownerDraft.phoneNo" name="phoneNo" placeholder="Phone number" />
          </div>

          <div class="mt-4 flex gap-2">
            <button type="button" (click)="createOwner()" [disabled]="savingOwner() || !isValidOwner()"
              class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">
              Create Owner
            </button>
            <button type="button" (click)="resetOwner()" [disabled]="savingOwner()"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Reset
            </button>
          </div>
        </section>
      }
    </div>
  `,
})
export class ShopDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly shopApi = inject(ShopApiService);
  private readonly ownerApi = inject(ShopOwnerApiService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly imageUpload = inject(ImageUploadService);

  readonly isSystemAdmin = computed(() => this.session.user()?.role === 'system_admin');
  readonly savingOwner = signal(false);
  readonly savingShop = signal(false);
  readonly imageProcessing = signal(false);
  readonly shop = signal<ShopDetail | null>(null);
  readonly shopId = signal<number>(0);

  shopDraft: UpdateShopRequest = {};
  ownerDraft: Omit<CreateShopOwnerRequest, 'shopId'> = {
    username: '',
    name: '',
    profileUrl: '',
    email: '',
    password: '',
    phoneNo: '',
  };
  photoPreviewUrl = '';

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('shopId'));
    this.shopId.set(Number.isFinite(id) ? id : 0);
    void this.loadShop();
  }

  isValidOwner(): boolean {
    return !!this.ownerDraft.username.trim()
      && !!this.ownerDraft.name.trim()
      && !!this.ownerDraft.profileUrl.trim()
      && !!this.ownerDraft.email.trim()
      && !!this.ownerDraft.password.trim()
      && !!this.ownerDraft.phoneNo.trim()
      && this.shopId() > 0;
  }

  async createOwner(): Promise<void> {
    if (!this.isSystemAdmin() || !this.isValidOwner()) return;
    this.savingOwner.set(true);
    try {
      await this.ownerApi.createOwner({
        ...this.ownerDraft,
        username: this.ownerDraft.username.trim(),
        name: this.ownerDraft.name.trim(),
        profileUrl: this.ownerDraft.profileUrl.trim(),
        email: this.ownerDraft.email.trim(),
        phoneNo: this.ownerDraft.phoneNo.trim(),
        shopId: this.shopId(),
      });
      this.toast.success('Shop owner created');
      this.resetOwner();
      await this.loadShop();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to create shop owner');
    } finally {
      this.savingOwner.set(false);
    }
  }

  async saveShop(): Promise<void> {
    if (!this.isSystemAdmin() || this.shopId() <= 0) return;
    this.savingShop.set(true);
    try {
      const payload: UpdateShopRequest = {};
      if (this.shopDraft.name?.trim()) payload.name = this.shopDraft.name.trim();
      if (this.shopDraft.type?.trim()) payload.type = this.shopDraft.type.trim();
      if (this.shopDraft.phoneNo?.trim()) payload.phoneNo = this.shopDraft.phoneNo.trim();
      if (this.shopDraft.shopPhotoUrl?.trim()) payload.shopPhotoUrl = this.shopDraft.shopPhotoUrl.trim();
      await this.shopApi.update(this.shopId(), payload);
      this.toast.success('Shop updated');
      await this.loadShop();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to update shop');
    } finally {
      this.savingShop.set(false);
    }
  }

  resetOwner(): void {
    this.revokePhotoPreviewUrl();
    this.ownerDraft = {
      username: '',
      name: '',
      profileUrl: '',
      email: '',
      password: '',
      phoneNo: '',
    };
  }

  onOwnerPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.setPhotoPreviewUrl(URL.createObjectURL(file));
    this.ownerDraft.profileUrl = '';
    this.imageProcessing.set(true);
    void this.imageUpload
      .uploadPublicImage(file)
      .then(url => {
        this.ownerDraft.profileUrl = url;
        this.revokePhotoPreviewUrl();
      })
      .catch(e => {
        this.toast.error(e instanceof Error ? e.message : 'Failed to upload image');
        this.ownerDraft.profileUrl = '';
        this.revokePhotoPreviewUrl();
      })
      .finally(() => this.imageProcessing.set(false));
    (event.target as HTMLInputElement).value = '';
  }

  private async loadShop(): Promise<void> {
    if (!this.isSystemAdmin() || this.shopId() <= 0) return;
    try {
      const detail = await this.shopApi.getById(this.shopId());
      this.shop.set(detail);
      this.shopDraft = {
        name: detail.name ?? '',
        type: detail.type ?? '',
        phoneNo: detail.phoneNo ?? '',
        shopPhotoUrl: detail.shopPhotoUrl ?? '',
      };
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to load shop detail');
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
