import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import type { PermissionGroup } from './roles.model';
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
              [disabled]="editMode()"
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
              @for (g of groups; track g.id) {
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
                    (click)="selectAllInGroup(r.id, g)"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                    [disabled]="!canEditPermissions(r)"
                    (click)="deselectAllInGroup(r.id, g)"
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
                      [checked]="isPermissionChecked(r, p.id)"
                      [disabled]="!canEditPermissions(r)"
                      (change)="onPermissionCheckbox($event, r.id, p.id)"
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
  readonly rolesService = inject(RolesService);

  protected readonly groups: PermissionGroup[] = this.rolesService.permissionGroups;
  protected readonly selectedGroupId = signal(this.groups[0]?.id ?? '');
  protected readonly editMode = signal(false);
  /** Working copy of permission ids while editing; empty when not in edit mode. */
  protected readonly draftPermissionIds = signal<string[]>([]);

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

  protected readonly selectedGroup = computed(() => {
    const id = this.selectedGroupId();
    return this.groups.find((g) => g.id === id) ?? this.groups[0];
  });

  constructor() {
    void this.rolesService.loadRoles();

    effect(() => {
      if (this.rolesService.rolesLoadState() !== 'ready') return;
      const id = this.roleId();
      if (!id) return;
      untracked(() => {
        if (this.rolesService.getRole(id)) {
          return;
        }
        void (async () => {
          try {
            const role = await this.rolesService.getRoleById(id);
            if (!role) {
              void this.router.navigate(['/dashboard', 'configurations', 'roles']);
            }
          } catch {
            void this.router.navigate(['/dashboard', 'configurations', 'roles']);
          }
        })();
      });
    });

    effect(() => {
      this.roleId();
      untracked(() => {
        this.editMode.set(false);
        this.draftPermissionIds.set([]);
      });
    });
  }

  protected retryLoad(): void {
    void this.rolesService.loadRoles();
  }

  protected isPermissionChecked(r: { permissionIds: string[] }, permissionId: string): boolean {
    if (this.editMode()) {
      return this.draftPermissionIds().includes(permissionId);
    }
    return r.permissionIds.includes(permissionId);
  }

  protected canEditPermissions(r: { status: string }): boolean {
    return this.editMode() && r.status === 'active';
  }

  protected isDirty(): boolean {
    if (!this.editMode()) return false;
    const r = this.role();
    if (!r) return false;
    const a = [...this.draftPermissionIds()].sort().join('\u0000');
    const b = [...r.permissionIds].sort().join('\u0000');
    return a !== b;
  }

  protected startEdit(): void {
    const r = this.role();
    if (!r || r.status !== 'active') return;
    this.draftPermissionIds.set([...r.permissionIds]);
    this.editMode.set(true);
  }

  protected cancelEdit(): void {
    this.editMode.set(false);
    this.draftPermissionIds.set([]);
  }

  /**
   * Persists draft permissions to the in-memory store.
   * TODO: call backend API here (e.g. PUT role permissions) and only update local state on success.
   */
  protected savePermissions(): void {
    const r = this.role();
    if (!r || !this.editMode()) return;
    this.rolesService.setRolePermissions(r.id, [...this.draftPermissionIds()]);
    this.cancelEdit();
  }

  protected onPermissionCheckbox(ev: Event, _roleId: string, permissionId: string): void {
    const checked = (ev.target as HTMLInputElement).checked;
    this.draftPermissionIds.update((ids) => {
      const set = new Set(ids);
      if (checked) set.add(permissionId);
      else set.delete(permissionId);
      return [...set];
    });
  }

  protected selectAllInGroup(_roleId: string, group: PermissionGroup): void {
    this.draftPermissionIds.update((ids) => {
      const set = new Set(ids);
      for (const p of group.permissions) set.add(p.id);
      return [...set];
    });
  }

  protected deselectAllInGroup(_roleId: string, group: PermissionGroup): void {
    this.draftPermissionIds.update((ids) => {
      const remove = new Set(group.permissions.map((p) => p.id));
      return ids.filter((id) => !remove.has(id));
    });
  }

  protected toggleDisable(): void {
    const r = this.role();
    if (!r) return;
    this.rolesService.setRoleStatus(r.id, r.status === 'active' ? 'disabled' : 'active');
    if (r.status === 'active') {
      this.cancelEdit();
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
