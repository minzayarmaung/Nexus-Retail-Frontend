import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import { EmployeeApiService } from './employee.api';
import type { EmployeeDto, EmployeeRequest } from './employee.model';

@Component({
  selector: 'app-employee-management',
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Employees</h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
          @if (canManage()) { Manage employees in your shop. } @else { Read-only employee view. }
        </p>
      </div>

      @if (!canView()) {
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          You do not have permission to view employees.
        </div>
      } @else {
        @if (canManage()) {
          <section class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {{ editingId() ? 'Edit Employee' : 'Create Employee' }}
            </h2>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                [(ngModel)]="draft.firstName" name="firstName" placeholder="First name" />
              <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                [(ngModel)]="draft.lastName" name="lastName" placeholder="Last name" />
              <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                [(ngModel)]="draft.email" name="email" placeholder="Email" />
              <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                [(ngModel)]="draft.phoneNo" name="phoneNo" placeholder="Phone number" />
              <input class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                [(ngModel)]="draft.position" name="position" placeholder="Position (HR, SALESPERSON)" />
              <input type="date" class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                [(ngModel)]="draft.hireDate" name="hireDate" />
              <input class="sm:col-span-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                [(ngModel)]="draft.address" name="address" placeholder="Address" />
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button type="button" (click)="save()" [disabled]="saving() || !isValidDraft()"
                class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">
                {{ editingId() ? 'Save Changes' : 'Create Employee' }}
              </button>
              <button type="button" (click)="resetDraft()" [disabled]="saving()"
                class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Reset
              </button>
            </div>
          </section>
        }

        <section class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Employee List</h2>
          <div class="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/40">
                <tr>
                  <th class="px-3 py-2 text-left font-semibold">Name</th>
                  <th class="px-3 py-2 text-left font-semibold">Email</th>
                  <th class="px-3 py-2 text-left font-semibold">Phone</th>
                  <th class="px-3 py-2 text-left font-semibold">Position</th>
                  @if (canManage()) { <th class="px-3 py-2 text-right font-semibold">Actions</th> }
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (e of employees(); track e.id) {
                  <tr>
                    <td class="px-3 py-2">{{ e.firstName }} {{ e.lastName }}</td>
                    <td class="px-3 py-2">{{ e.email }}</td>
                    <td class="px-3 py-2">{{ e.phoneNo }}</td>
                    <td class="px-3 py-2">{{ e.position || '—' }}</td>
                    @if (canManage()) {
                      <td class="px-3 py-2">
                        <div class="flex justify-end gap-2">
                          <button type="button" (click)="edit(e)" class="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700">Edit</button>
                          <button type="button" (click)="remove(e.id)" class="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">Delete</button>
                        </div>
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr><td [attr.colspan]="canManage() ? 5 : 4" class="px-3 py-4 text-center text-slate-500">No employees found.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `
})
export class EmployeeManagementComponent {
  private readonly api = inject(EmployeeApiService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly employees = signal<EmployeeDto[]>([]);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);

  draft: EmployeeRequest = { firstName: '', lastName: '', email: '', phoneNo: '', address: '', position: '', hireDate: '' };

  readonly canView = computed(() => {
    const r = this.session.user()?.role;
    return r === 'system_admin' || r === 'company_admin';
  });

  readonly canManage = computed(() => this.session.user()?.role === 'company_admin');

  constructor() {
    void this.reload();
  }

  async reload(): Promise<void> {
    if (!this.canView()) return;
    try {
      this.employees.set(await this.api.getAll());
    } catch (e) {
      this.toast.error(this.errMsg(e));
    }
  }

  isValidDraft(): boolean {
    return !!this.draft.firstName?.trim()
      && !!this.draft.lastName?.trim()
      && !!this.draft.email?.trim()
      && !!this.draft.phoneNo?.trim();
  }

  edit(e: EmployeeDto): void {
    this.editingId.set(e.id);
    this.draft = {
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      phoneNo: e.phoneNo,
      address: e.address ?? '',
      position: e.position ?? '',
      hireDate: e.hireDate ?? '',
      dateOfBirth: e.dateOfBirth ?? '',
      salary: e.salary ?? ''
    };
  }

  resetDraft(): void {
    this.editingId.set(null);
    this.draft = { firstName: '', lastName: '', email: '', phoneNo: '', address: '', position: '', hireDate: '' };
  }

  async save(): Promise<void> {
    if (!this.canManage() || !this.isValidDraft()) return;
    this.saving.set(true);
    try {
      const payload: EmployeeRequest = {
        ...this.draft,
        firstName: this.draft.firstName.trim(),
        lastName: this.draft.lastName.trim(),
        email: this.draft.email.trim(),
        phoneNo: this.draft.phoneNo.trim(),
        address: this.draft.address?.trim(),
        position: this.draft.position?.trim(),
      };
      const id = this.editingId();
      if (id) {
        await this.api.update(id, payload);
        this.toast.success('Employee updated');
      } else {
        await this.api.create(payload);
        this.toast.success('Employee created');
      }
      await this.reload();
      this.resetDraft();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: number): Promise<void> {
    if (!this.canManage()) return;
    this.saving.set(true);
    try {
      await this.api.delete(id);
      this.toast.success('Employee deleted');
      await this.reload();
      if (this.editingId() === id) this.resetDraft();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
      this.saving.set(false);
    }
  }

  private errMsg(e: unknown): string {
    return e instanceof Error ? e.message : 'Something went wrong';
  }
}

