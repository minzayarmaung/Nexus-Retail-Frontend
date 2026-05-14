export type RoleStatus = 'active' | 'disabled';

/** Shape returned by GET /roles (list) */
export interface RoleApiDto {
  id: number;
  name: string;
  description: string | null;
  is_disabled: boolean;
}

/** Single permission row from GET /roles/{id} */
export interface PermissionUsageItem {
  grouping: string;
  code: string;
  entityName: string;
  actionName: string;
  selected: boolean;
}

/** GET /roles/{id} */
export interface RoleDetailApiDto extends RoleApiDto {
  permissionUsageData?: PermissionUsageItem[];
}

export interface CreateRoleRequest {
  name: string;
  description: string | null;
  is_disabled: boolean;
}

/** PATCH /roles/{id} body */
export interface UpdateRoleBodyRequest {
  name: string;
  description: string | null;
  is_disabled: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  /** @deprecated use permissionUsageData + selected; kept for any legacy paths */
  permissionIds: string[];
  permissionUsageData?: PermissionUsageItem[];
}

export interface PermissionDef {
  id: string;
  code: string;
  label: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: PermissionDef[];
}
