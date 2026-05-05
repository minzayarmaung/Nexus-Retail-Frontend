import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import { ShopOwnerApiService } from './shop-owner.api';
import type { CreateShopOwnerRequest } from './shop-owner.model';

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
          <div class="grid gap-3 sm:grid-cols-2">
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.username" name="username" placeholder="Username" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.email" name="email" placeholder="Email" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.password" name="password" placeholder="Password" type="password" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.phoneNo" name="phoneNo" placeholder="Phone number" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.shopId" name="shopId" placeholder="Shop ID" type="number" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
              [(ngModel)]="draft.firstName" name="firstName" placeholder="First name (optional)" />
            <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40 sm:col-span-2"
              [(ngModel)]="draft.lastName" name="lastName" placeholder="Last name (optional)" />
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

  readonly saving = signal(false);
  readonly isSystemAdmin = computed(() => this.session.user()?.role === 'system_admin');

  draft: Partial<CreateShopOwnerRequest> = {
    username: '',
    email: '',
    password: '',
    phoneNo: '',
    shopId: undefined,
    firstName: '',
    lastName: ''
  };

  isValid(): boolean {
    return !!this.draft.username?.trim()
      && !!this.draft.email?.trim()
      && !!this.draft.password?.trim()
      && !!this.draft.phoneNo?.trim()
      && !!this.draft.shopId;
  }

  reset(): void {
    this.draft = {
      username: '',
      email: '',
      password: '',
      phoneNo: '',
      shopId: undefined,
      firstName: '',
      lastName: ''
    };
  }

  async create(): Promise<void> {
    if (!this.isSystemAdmin() || !this.isValid()) return;
    this.saving.set(true);
    try {
      await this.api.createOwner({
        username: this.draft.username!.trim(),
        email: this.draft.email!.trim(),
        password: this.draft.password!,
        phoneNo: this.draft.phoneNo!.trim(),
        shopId: Number(this.draft.shopId),
        firstName: this.draft.firstName?.trim(),
        lastName: this.draft.lastName?.trim()
      });
      this.toast.success('Shop owner created');
      this.reset();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to create shop owner');
    } finally {
      this.saving.set(false);
    }
  }
}

