export type RoleStatus = 'active' | 'disabled';

export interface Role {
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  /** Granted permission definition ids */
  permissionIds: string[];
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
