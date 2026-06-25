import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/toast/toast.service';
import { PasswordPreferencesService } from './password-preferences.service';

@Component({
  selector: 'app-password-preferences-list',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="mx-auto max-w-5xl space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <a
            routerLink="/dashboard/organization"
            class="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            ← Organization
          </a>
          <h1 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Password Preferences
          </h1>
          <p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Select the password validation policy for your organization.
          </p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
        @if (passwordService.loadState() === 'loading' || passwordService.loadState() === 'idle') {
          <p class="py-10 text-center text-sm text-slate-600 dark:text-slate-400">Loading password preferences…</p>
        } @else if (passwordService.loadState() === 'error') {
          <div
            class="rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          >
            <p class="font-medium">Could not load password preferences</p>
            <p class="mt-1 opacity-90">{{ passwordService.loadError() }}</p>
            <button
              type="button"
              class="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold"
              (click)="loadPreferences()"
            >
              Retry
            </button>
          </div>
        } @else {
          <div class="space-y-4">
            @for (policy of passwordService.policies(); track policy.id) {
              <label
                class="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-900/50"
                [class.border-slate-900]="policy.active"
                [class.bg-slate-50]="policy.active"
                [class.dark:border-slate-100]="policy.active"
                [class.dark:bg-slate-800]="policy.active"
              >
                <input
                  type="radio"
                  [name]="'password-policy'"
                  [value]="policy.id"
                  [(ngModel)]="selectedPolicyId"
                  class="mt-1 size-4 accent-slate-900 dark:accent-slate-100"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-slate-900 dark:text-slate-100">
                      {{ policy.key }}
                    </span>
                    @if (policy.active) {
                      <span
                        class="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
                      >
                        Active
                      </span>
                    }
                  </div>
                  <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {{ policy.description }}
                  </p>
                </div>
              </label>
            } @empty {
              <p class="py-8 text-center text-slate-500 dark:text-slate-400">
                No password preferences available.
              </p>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class PasswordPreferencesListComponent implements OnInit, OnDestroy {
  readonly passwordService = inject(PasswordPreferencesService);
  private readonly toast = inject(ToastService);

  selectedPolicyId: number | null = null;
  initialPolicyId: number | null = null;

  ngOnInit(): void {
    void this.loadPreferences();
  }

  ngOnDestroy(): void {
    void this.saveOnExit();
  }

  async loadPreferences(): Promise<void> {
    await this.passwordService.loadPasswordPreferences();
    const activePolicy = this.passwordService.policies().find((p) => p.active);
    this.selectedPolicyId = activePolicy?.id ?? null;
    this.initialPolicyId = this.selectedPolicyId;
  }

  async saveOnExit(): Promise<void> {
    if (this.selectedPolicyId === null || this.selectedPolicyId === this.initialPolicyId) {
      return;
    }

    try {
      await this.passwordService.updatePasswordPreference(this.selectedPolicyId);
      this.toast.success('Password preference updated successfully');
    } catch (e) {
      this.toast.error('Failed to update password preference');
    }
  }
}
