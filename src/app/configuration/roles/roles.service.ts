import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { PermissionGroup, Role, RoleApiDto, RoleStatus } from './roles.model';
import { RolesApiService } from './roles.api';

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'user',
    name: 'User management',
    permissions: [
      { id: 'p-user-read', code: 'READ_USER', label: 'View users' },
      { id: 'p-user-create', code: 'CREATE_USER', label: 'Create user' },
      { id: 'p-user-update', code: 'UPDATE_USER', label: 'Edit user' },
      { id: 'p-user-delete', code: 'DELETE_USER', label: 'Delete user' }
    ]
  },
  {
    id: 'loan',
    name: 'Loan',
    permissions: [
      { id: 'p-loan-read', code: 'READ_LOAN', label: 'View loans' },
      { id: 'p-loan-approve', code: 'APPROVE_LOAN', label: 'Approve loan' },
      { id: 'p-loan-disburse', code: 'DISBURSE_LOAN', label: 'Disburse loan' },
      { id: 'p-loan-repay', code: 'REPAY_LOAN', label: 'Record repayment' }
    ]
  },
  {
    id: 'accounting',
    name: 'Accounting',
    permissions: [
      { id: 'p-gl-read', code: 'READ_GL', label: 'View GL' },
      { id: 'p-gl-post', code: 'POST_JOURNAL', label: 'Post journal' },
      { id: 'p-gl-reverse', code: 'REVERSE_ENTRY', label: 'Reverse entry' }
    ]
  },
  {
    id: 'org',
    name: 'Organization',
    permissions: [
      { id: 'p-org-read', code: 'READ_OFFICE', label: 'View offices' },
      { id: 'p-org-config', code: 'CONFIGURE_SYSTEM', label: 'Configure system' },
      { id: 'p-org-role', code: 'MANAGE_ROLES', label: 'Manage roles' }
    ]
  }
];

function mapApiRoleToRole(dto: RoleApiDto): Role {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? '',
    status: dto.is_disabled ? 'disabled' : 'active',
    permissionIds: []
  };
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly rolesApi = inject(RolesApiService);

  private readonly roles = signal<Role[]>([]);
  private localRoleSeq = 0;

  readonly permissionGroups = PERMISSION_GROUPS;
  readonly rolesReadonly = this.roles.asReadonly();
  /** Reflects last GET /roles attempt (permissions screen waits on `ready`). */
  readonly rolesLoadState = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly rolesLoadError = signal<string | null>(null);

  listRoles(): Role[] {
    return this.roles();
  }

  getRole(id: string): Role | undefined {
    return this.roles().find((r) => r.id === id);
  }

  async loadRoles(): Promise<void> {
    this.rolesLoadState.set('loading');
    this.rolesLoadError.set(null);
    try {
      const dtos = await firstValueFrom(this.rolesApi.getRoles());
      this.roles.set(dtos.map(mapApiRoleToRole));
      this.rolesLoadState.set('ready');
    } catch (e) {
      this.rolesLoadError.set(e instanceof Error ? e.message : 'Failed to load roles');
      this.rolesLoadState.set('error');
      this.roles.set([]);
    }
  }

  createRole(name: string, description: string): Role {
    const role: Role = {
      id: `local-${++this.localRoleSeq}`,
      name: name.trim(),
      description: description.trim(),
      status: 'active',
      permissionIds: []
    };
    this.roles.update((list) => [...list, role]);
    return role;
  }

  updateRoleMeta(id: string, name: string, description: string): void {
    this.roles.update((list) =>
      list.map((r) =>
        r.id === id ? { ...r, name: name.trim(), description: description.trim() } : r
      )
    );
  }

  setRoleStatus(id: string, status: RoleStatus): void {
    this.roles.update((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  setRolePermissions(id: string, permissionIds: string[]): void {
    this.roles.update((list) =>
      list.map((r) => (r.id === id ? { ...r, permissionIds: [...permissionIds] } : r))
    );
  }

  togglePermission(roleId: string, permissionId: string, granted: boolean): void {
    this.roles.update((list) =>
      list.map((r) => {
        if (r.id !== roleId) return r;
        const set = new Set(r.permissionIds);
        if (granted) set.add(permissionId);
        else set.delete(permissionId);
        return { ...r, permissionIds: [...set] };
      })
    );
  }

  setGroupPermissions(roleId: string, group: PermissionGroup, grant: boolean): void {
    const idsInGroup = new Set(group.permissions.map((p) => p.id));
    this.roles.update((list) =>
      list.map((r) => {
        if (r.id !== roleId) return r;
        const next = new Set(r.permissionIds);
        for (const pid of idsInGroup) {
          if (grant) next.add(pid);
          else next.delete(pid);
        }
        return { ...r, permissionIds: [...next] };
      })
    );
  }

  deleteRole(id: string): void {
    this.roles.update((list) => list.filter((r) => r.id !== id));
  }
}
