export type RoleStatus = 'active' | 'disabled';

/** Shape returned by GET /roles */
export interface RoleApiDto {
  id: number;
  name: string;
  description: string | null;
  is_disabled: boolean;
}

export interface Role {
  /** Stable id for routing (numeric id from API as string, or client prefix for local-only rows). */
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  /** Granted permission definition ids (local until permissions API exists). */
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
