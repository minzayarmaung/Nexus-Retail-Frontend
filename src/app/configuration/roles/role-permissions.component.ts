import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from '../../core/toast/toast.service';
import type { PermissionGroup, Role } from './roles.model';
import { RolesService } from './roles.service';

@Component({
  selector: 'app-role-permissions',
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-7xl space-y-6">
      @if (rolesService.rolesLoadState() === 'error') {
        <div class="rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <p class="font-medium">Could not load role</p>
          <p class="mt-1 opacity-90">{{ rolesService.rolesLoadError() }}</p>
          <button
            type="button"
            class="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100 dark:hover:bg-red-900/40"
            (click)="retryLoad()"
          >
            Retry
          </button>
          <a
            routerLink="/dashboard/configurations/roles"
            class="ml-3 text-xs font-medium text-red-900 underline dark:text-red-200"
            >Back to roles</a>
        </div>
      } @else if (rolesService.rolesLoadState() !== 'ready') {
        <p class="py-10 text-center text-sm text-slate-600 dark:text-slate-400">Loading role…</p>
      } @else if (role(); as r) {
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <a
              routerLink="/dashboard/configurations/roles"
              class="mb-2 inline-flex text-sm font-medium text-slate-600 no-underline hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              ← Back to roles
            </a>
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{{ r.name }}</h1>
            <p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
              {{ r.description || 'No description.' }}
            </p>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Status:
              <span class="font-medium text-slate-800 dark:text-slate-200">{{
                r.status === 'active' ? 'Active' : 'Disabled'
              }}</span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            @if (!editMode()) {
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                [disabled]="r.status === 'disabled'"
                (click)="startEdit()"
              >
                Edit Role
              </button>
            } @else {
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                (click)="cancelEdit()"
              >
                Cancel
              </button>
              <button
                type="button"
                class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                [disabled]="!isDirty()"
                (click)="savePermissions()"
              >
                Save
              </button>
            }
            <button
              type="button"
              class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"
              [disabled]="editMode() || roleActionLoading()"
              (click)="toggleDisable()"
            >
              {{ r.status === 'active' ? 'Disable Role' : 'Enable Role' }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/60"
              [disabled]="editMode()"
              (click)="deleteRole()"
            >
              Delete Role
            </button>
          </div>
        </div>

        @if (detailLoading()) {
          <p class="py-6 text-center text-sm text-slate-600 dark:text-slate-400">Loading permissions…</p>
        } @else if (!dynamicGroups().length) {
          <p class="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No permission data for this role.
          </p>
        } @else {
          <div
            class="grid gap-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
          >
            <nav
              class="border-b border-slate-200 p-3 dark:border-slate-700 lg:border-b-0 lg:border-r"
              aria-label="Permission groups"
            >
              <p class="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Groups
              </p>
              <ul class="space-y-1">
                @for (g of dynamicGroups(); track g.id) {
                  <li>
                    <button
                      type="button"
                      class="flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition"
                      [class.bg-slate-100]="selectedGroupId() === g.id"
                      [class.text-slate-900]="selectedGroupId() === g.id"
                      [class.dark:bg-white/10]="selectedGroupId() === g.id"
                      [class.dark:text-white]="selectedGroupId() === g.id"
                      [class.text-slate-600]="selectedGroupId() !== g.id"
                      [class.hover:bg-slate-50]="selectedGroupId() !== g.id"
                      [class.dark:text-slate-300]="selectedGroupId() !== g.id"
                      [class.dark:hover:bg-slate-800/60]="selectedGroupId() !== g.id"
                      (click)="selectedGroupId.set(g.id)"
                    >
                      {{ g.name }}
                    </button>
                  </li>
                }
              </ul>
            </nav>

            <div class="p-5">
              @if (selectedGroup(); as g) {
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ g.name }}</h2>
                    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Toggle permissions for this role.</p>
                  </div>
                  <div class="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                      [disabled]="!canEditPermissions(r)"
                      (click)="selectAllInGroup(g)"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                      [disabled]="!canEditPermissions(r)"
                      (click)="deselectAllInGroup(g)"
                    >
                      Deselect all
                    </button>
                  </div>
                </div>
                <ul class="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  @for (p of g.permissions; track p.id) {
                    <li class="flex items-start gap-3 py-3">
                      <input
                        type="checkbox"
                        class="mt-1 size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-white/20"
                        [checked]="isPermissionChecked(r, p.code)"
                        [disabled]="!canEditPermissions(r)"
                        (change)="onPermissionCheckbox($event, p.code)"
                      />
                      <div>
                        <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ p.label }}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">{{ p.code }}</p>
                      </div>
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
        }
      } @else {
        <p class="py-10 text-center text-sm text-slate-600 dark:text-slate-400">
          Role not found.
          <a
            routerLink="/dashboard/configurations/roles"
            class="ml-2 font-medium text-slate-900 underline dark:text-slate-200"
            >Back to roles</a>
        </p>
      }
    </div>
  `
})
export class RolePermissionsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly rolesService = inject(RolesService);

  protected readonly selectedGroupId = signal('');
  protected readonly editMode = signal(false);
  protected readonly draftSelectedCodes = signal<string[]>([]);
  protected readonly detailLoading = signal(false);
  protected readonly roleActionLoading = signal(false);

  private readonly roleId = toSignal(this.route.paramMap.pipe(map((p) => p.get('roleId'))), {
    initialValue: null
  });

  protected readonly role = computed(() => {
    if (this.rolesService.rolesLoadState() !== 'ready') {
      return undefined;
    }
    const id = this.roleId();
    if (!id) return undefined;
    return this.rolesService.getRole(id);
  });

  protected readonly dynamicGroups = computed((): PermissionGroup[] => {
    const r = this.role();
    const items = r?.permissionUsageData;
    if (!items?.length) return [];
    const by = new Map<string, PermissionGroup>();
    for (const it of items) {
      const gid = it.grouping;
      if (!by.has(gid)) {
        by.set(gid, { id: gid, name: this.formatGroupingLabel(gid), permissions: [] });
      }
      by.get(gid)!.permissions.push({
        id: it.code,
        code: it.code,
        label: `${it.entityName} — ${it.actionName}`
      });
    }
    return [...by.values()].map((g) => ({
      ...g,
      permissions: [...g.permissions].sort((a, b) => a.code.localeCompare(b.code))
    }));
  });

  protected readonly selectedGroup = computed(() => {
    const id = this.selectedGroupId();
    const list = this.dynamicGroups();
    return list.find((g) => g.id === id) ?? list[0];
  });

  constructor() {
    void this.rolesService.loadRoles();

    effect(() => {
      if (this.rolesService.rolesLoadState() !== 'ready') return;
      const id = this.roleId();
      if (!id) return;
      const r = this.rolesService.getRole(id);
      if (r?.permissionUsageData?.length) return;
      untracked(() => {
        this.detailLoading.set(true);
        void this.rolesService
          .loadRoleDetail(id)
          .then((loaded) => {
            if (!loaded) {
              void this.router.navigate(['/dashboard', 'configurations', 'roles']);
            }
          })
          .catch(() => {
            void this.router.navigate(['/dashboard', 'configurations', 'roles']);
          })
          .finally(() => {
            this.detailLoading.set(false);
          });
      });
    });

    effect(() => {
      const list = this.dynamicGroups();
      untracked(() => {
        const cur = this.selectedGroupId();
        if (!list.length) {
          this.selectedGroupId.set('');
          return;
        }
        if (!cur || !list.some((g) => g.id === cur)) {
          this.selectedGroupId.set(list[0].id);
        }
      });
    });

    effect(() => {
      this.roleId();
      untracked(() => {
        this.editMode.set(false);
        this.draftSelectedCodes.set([]);
      });
    });
  }

  protected formatGroupingLabel(grouping: string): string {
    const s = grouping.replace(/_/g, ' ').trim();
    if (!s) return grouping;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  protected retryLoad(): void {
    void this.rolesService.loadRoles();
  }

  protected isPermissionChecked(r: Role, code: string): boolean {
    if (this.editMode()) {
      return this.draftSelectedCodes().includes(code);
    }
    const item = r.permissionUsageData?.find((x) => x.code === code);
    return !!item?.selected;
  }

  protected canEditPermissions(r: { status: string }): boolean {
    return this.editMode() && r.status === 'active';
  }

  protected isDirty(): boolean {
    if (!this.editMode()) return false;
    const r = this.role();
    if (!r?.permissionUsageData) return false;
    const initial = r.permissionUsageData.filter((i) => i.selected).map((i) => i.code);
    return this.sortedKey(this.draftSelectedCodes()) !== this.sortedKey(initial);
  }

  private sortedKey(codes: string[]): string {
    return [...codes].sort().join('\u0000');
  }

  protected startEdit(): void {
    const r = this.role();
    if (!r || r.status !== 'active') return;
    const codes = (r.permissionUsageData ?? []).filter((i) => i.selected).map((i) => i.code);
    this.draftSelectedCodes.set(codes);
    this.editMode.set(true);
  }

  protected cancelEdit(): void {
    this.editMode.set(false);
    this.draftSelectedCodes.set([]);
  }

  protected savePermissions(): void {
    const r = this.role();
    if (!r || !this.editMode()) return;
    this.rolesService.applyPermissionDraft(r.id, [...this.draftSelectedCodes()]);
    this.cancelEdit();
  }

  protected onPermissionCheckbox(ev: Event, code: string): void {
    const checked = (ev.target as HTMLInputElement).checked;
    this.draftSelectedCodes.update((codes) => {
      const set = new Set(codes);
      if (checked) set.add(code);
      else set.delete(code);
      return [...set];
    });
  }

  protected selectAllInGroup(group: PermissionGroup): void {
    this.draftSelectedCodes.update((codes) => {
      const set = new Set(codes);
      for (const p of group.permissions) set.add(p.code);
      return [...set];
    });
  }

  protected deselectAllInGroup(group: PermissionGroup): void {
    const remove = new Set(group.permissions.map((p) => p.code));
    this.draftSelectedCodes.update((codes) => codes.filter((c) => !remove.has(c)));
  }

  protected async toggleDisable(): Promise<void> {
    const r = this.role();
    if (!r || this.editMode()) return;
    this.roleActionLoading.set(true);
    try {
      await this.rolesService.setRoleDisabled(r.id, r.status === 'active');
      if (r.status === 'active') {
        this.cancelEdit();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update role';
      this.toast.error(msg);
    } finally {
      this.roleActionLoading.set(false);
    }
  }

  protected deleteRole(): void {
    const r = this.role();
    if (!r) return;
    if (!confirm(`Delete role "${r.name}"? This cannot be undone.`)) return;
    this.rolesService.deleteRole(r.id);
    void this.router.navigate(['/dashboard', 'configurations', 'roles']);
  }
}
