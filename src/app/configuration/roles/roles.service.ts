import { Injectable, signal } from '@angular/core';
import type { PermissionGroup, Role, RoleStatus } from './roles.model';

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

const initialRoles: Role[] = [
  {
    id: 'r-1',
    name: 'Self Service User',
    description: 'Limited self-service access for clients.',
    status: 'active',
    permissionIds: ['p-user-read', 'p-loan-read']
  },
  {
    id: 'r-2',
    name: 'Loan Officer',
    description: 'Origination and servicing for assigned portfolio.',
    status: 'active',
    permissionIds: ['p-loan-read', 'p-loan-approve', 'p-user-read']
  }
];

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly roles = signal<Role[]>([...initialRoles]);
  private nextId = 3;

  readonly permissionGroups = PERMISSION_GROUPS;
  /** Read-only signal of all roles (reactive). */
  readonly rolesReadonly = this.roles.asReadonly();

  listRoles(): Role[] {
    return this.roles();
  }

  getRole(id: string): Role | undefined {
    return this.roles().find((r) => r.id === id);
  }

  createRole(name: string, description: string): Role {
    const role: Role = {
      id: `r-${this.nextId++}`,
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

  /** Grant or revoke every permission in the given group for the role (single update). */
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
