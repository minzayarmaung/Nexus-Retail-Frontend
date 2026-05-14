import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Role, RoleApiDto, RoleDetailApiDto } from './roles.model';
import { RolesApiService } from './roles.api';

function mapListDto(dto: RoleApiDto): Role {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? '',
    status: dto.is_disabled ? 'disabled' : 'active',
    permissionIds: []
  };
}

function mapDetailToRole(dto: RoleDetailApiDto): Role {
  const usage = dto.permissionUsageData ? dto.permissionUsageData.map((u) => ({ ...u })) : undefined;
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? '',
    status: dto.is_disabled ? 'disabled' : 'active',
    permissionIds: (usage ?? []).filter((p) => p.selected).map((p) => p.code),
    permissionUsageData: usage
  };
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly rolesApi = inject(RolesApiService);

  private readonly roles = signal<Role[]>([]);

  readonly rolesReadonly = this.roles.asReadonly();
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
      this.roles.set(dtos.map(mapListDto));
      this.rolesLoadState.set('ready');
    } catch (e) {
      this.rolesLoadError.set(e instanceof Error ? e.message : 'Failed to load roles');
      this.rolesLoadState.set('error');
      this.roles.set([]);
    }
  }

  /** GET /roles/{id} — full role including permissionUsageData */
  async loadRoleDetail(id: string): Promise<Role | undefined> {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return undefined;
    }
    const dto = await firstValueFrom(this.rolesApi.getRoleById(numericId));
    const mapped = mapDetailToRole(dto);
    this.roles.update((list) => {
      const idx = list.findIndex((r) => r.id === mapped.id);
      if (idx === -1) return [...list, mapped];
      const copy = [...list];
      copy[idx] = mapped;
      return copy;
    });
    return mapped;
  }

  /** Used when opening permissions from the table (must hit GET /roles/{id}). */
  async ensureRoleDetailLoaded(id: string): Promise<boolean> {
    try {
      await this.loadRoleDetail(id);
      return true;
    } catch {
      return false;
    }
  }

  async createRole(name: string, description: string): Promise<Role> {
    const dto = await firstValueFrom(
      this.rolesApi.createRole({
        name: name.trim(),
        description: description.trim() || null,
        is_disabled: false
      })
    );
    const role = mapDetailToRole(dto);
    this.roles.update((list) => [...list, role]);
    return role;
  }

  async updateRoleMeta(id: string, name: string, description: string): Promise<void> {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      throw new Error('Invalid role id');
    }
    const cur = this.getRole(id);
    const dto = await firstValueFrom(
      this.rolesApi.updateRole(numericId, {
        name: name.trim(),
        description: description.trim() || null,
        is_disabled: cur?.status === 'disabled'
      })
    );
    const updated = mapDetailToRole(dto);
    this.roles.update((list) =>
      list.map((r) =>
        r.id === id
          ? {
              ...updated,
              permissionUsageData:
                (updated.permissionUsageData?.length ?? 0) > 0
                  ? updated.permissionUsageData
                  : r.permissionUsageData
            }
          : r
      )
    );
  }

  /** PATCH /roles/{id} with current name/description and new disabled flag */
  async setRoleDisabled(id: string, disabled: boolean): Promise<void> {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      throw new Error('Invalid role id');
    }
    const r = this.getRole(id);
    if (!r) {
      throw new Error('Role not found');
    }
    const dto = await firstValueFrom(
      this.rolesApi.updateRole(numericId, {
        name: r.name,
        description: r.description || null,
        is_disabled: disabled
      })
    );
    const updated = mapDetailToRole(dto);
    this.roles.update((list) =>
      list.map((role) =>
        role.id === id
          ? {
              ...updated,
              permissionUsageData:
                (updated.permissionUsageData?.length ?? 0) > 0
                  ? updated.permissionUsageData
                  : role.permissionUsageData
            }
          : role
      )
    );
  }

  applyPermissionDraft(roleId: string, selectedCodes: string[]): void {
    const set = new Set(selectedCodes);
    this.roles.update((list) =>
      list.map((r) => {
        if (r.id !== roleId) return r;
        if (!r.permissionUsageData?.length) {
          return { ...r, permissionIds: [...selectedCodes] };
        }
        const permissionUsageData = r.permissionUsageData.map((item) => ({
          ...item,
          selected: set.has(item.code)
        }));
        return {
          ...r,
          permissionUsageData,
          permissionIds: permissionUsageData.filter((p) => p.selected).map((p) => p.code)
        };
      })
    );
  }

  deleteRole(id: string): void {
    this.roles.update((list) => list.filter((r) => r.id !== id));
  }
}
