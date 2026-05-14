import { Component, computed, inject, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../core/toast/toast.service';
import type { Role } from './roles.model';
import { RolesService } from './roles.service';

@Component({
  selector: 'app-roles-list',
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-7xl space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Roles</h1>
          <p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Define roles and assign permissions. Click a row to manage permissions for that role.
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          (click)="openAddModal()"
        >
          Add Role
        </button>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
        @if (rolesService.rolesLoadState() === 'loading' || rolesService.rolesLoadState() === 'idle') {
          <p class="py-10 text-center text-sm text-slate-600 dark:text-slate-400">Loading roles…</p>
        } @else if (rolesService.rolesLoadState() === 'error') {
          <div class="rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <p class="font-medium">Could not load roles</p>
            <p class="mt-1 opacity-90">{{ rolesService.rolesLoadError() }}</p>
            <button
              type="button"
              class="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100 dark:hover:bg-red-900/40"
              (click)="retryLoad()"
            >
              Retry
            </button>
          </div>
        } @else {
        <input
          class="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
          [ngModel]="searchSig()"
          (ngModelChange)="searchSig.set($event)"
          name="roleSearch"
          placeholder="Filter by name or description..."
        />

        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th class="py-3 pr-4">Name</th>
                <th class="py-3 pr-4">Description</th>
                <th class="py-3 pr-4">Status</th>
                <th class="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of filtered(); track r.id) {
                <tr
                  class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  (click)="openPermissions(r)"
                >
                  <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{{ r.name }}</td>
                  <td class="max-w-md py-3 pr-4 text-slate-600 dark:text-slate-400">{{ r.description || '—' }}</td>
                  <td class="py-3 pr-4">
                    <span
                      class="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      [class.border-emerald-200]="r.status === 'active'"
                      [class.bg-emerald-50]="r.status === 'active'"
                      [class.text-emerald-800]="r.status === 'active'"
                      [class.dark:border-emerald-900/60]="r.status === 'active'"
                      [class.dark:bg-emerald-950/50]="r.status === 'active'"
                      [class.dark:text-emerald-200]="r.status === 'active'"
                      [class.border-slate-200]="r.status === 'disabled'"
                      [class.bg-slate-100]="r.status === 'disabled'"
                      [class.text-slate-600]="r.status === 'disabled'"
                      [class.dark:border-slate-700]="r.status === 'disabled'"
                      [class.dark:bg-slate-800/60]="r.status === 'disabled'"
                      [class.dark:text-slate-300]="r.status === 'disabled'"
                    >
                      {{ r.status === 'active' ? 'Active' : 'Disabled' }}
                    </span>
                  </td>
                  <td class="py-3 text-right">
                    <div class="flex justify-end gap-2">
                      <button
                        type="button"
                        class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                        (click)="openEditModal(r); $event.stopPropagation()"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                        (click)="openPermissions(r); $event.stopPropagation()"
                      >
                        Permissions
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="py-8 text-center text-slate-500 dark:text-slate-400">No roles match your filter.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        }
      </div>
    </div>

    @if (addOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-role-title"
        (click)="closeAddModal()"
      >
        <div
          class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          (click)="$event.stopPropagation()"
        >
          <h2 id="add-role-title" class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ editingRoleId ? 'Edit Role' : 'Add Role' }}
          </h2>
          <div class="mt-4 space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</label>
              <input
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="draftName"
                name="draftName"
                placeholder="Role name"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</label>
              <textarea
                class="min-h-[88px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="draftDescription"
                name="draftDescription"
                placeholder="Optional description"
              ></textarea>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
              (click)="closeAddModal()"
              [disabled]="submitting"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              [disabled]="!draftName.trim() || submitting"
              (click)="submitRole()"
            >
              {{ submitting ? 'Saving...' : editingRoleId ? 'Save Changes' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class RolesListComponent implements OnInit {
  readonly rolesService = inject(RolesService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly addOpen = signal(false);
  protected draftName = '';
  protected draftDescription = '';
  protected editingRoleId: string | null = null;
  protected submitting = false;

  protected readonly searchSig = signal('');

  protected readonly filtered = computed(() => {
    const q = this.searchSig().trim().toLowerCase();
    const list = this.rolesService.rolesReadonly();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  });

  ngOnInit(): void {
    void this.rolesService.loadRoles();
  }

  protected retryLoad(): void {
    void this.rolesService.loadRoles();
  }

  protected openAddModal(): void {
    this.draftName = '';
    this.draftDescription = '';
    this.editingRoleId = null;
    this.addOpen.set(true);
  }

  protected closeAddModal(): void {
    this.editingRoleId = null;
    this.addOpen.set(false);
  }

  protected openEditModal(role: Role): void {
    this.editingRoleId = role.id;
    this.draftName = role.name;
    this.draftDescription = role.description;
    this.addOpen.set(true);
  }

  protected async submitRole(): Promise<void> {
    const name = this.draftName.trim();
    if (!name) return;
    if (this.submitting) return;
    this.submitting = true;
    try {
      if (this.editingRoleId) {
        await this.rolesService.updateRoleMeta(this.editingRoleId, name, this.draftDescription);
        this.toast.success('Role updated');
      } else {
        await this.rolesService.createRole(name, this.draftDescription);
        this.toast.success('Role created');
      }
      this.closeAddModal();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save role';
      this.toast.error(msg);
    } finally {
      this.submitting = false;
    }
  }

  protected openPermissions(r: Role): void {
    void this.router.navigate(['/dashboard', 'configurations', 'roles', r.id, 'permissions']);
  }
}
