import type { UserRole } from '../user/user.model';

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  username: string;
  email: string;
  roles: string[];
  userId: string | number;
  firstName?: string;
  lastName?: string;
  isFirstTimeLogin?: boolean;
  isGeneratePassword?: boolean;
  cannotChangePassword?: boolean;
}

const ROLE_PRIORITY: UserRole[] = [
  'system_admin',
  'company_admin',
  'store_manager',
  'staff',
];

export function pickPrimaryRole(roles: string[] | null | undefined): string {
  if (!roles?.length) {
    throw new Error('Login response is missing roles');
  }
  const normalized = roles.map((r) => normalizeRoleName(r));
  for (const priority of ROLE_PRIORITY) {
    if (normalized.includes(priority)) {
      return roles[normalized.indexOf(priority)] ?? roles[0];
    }
  }
  return roles[0];
}

function normalizeRoleName(rawRole: string): string {
  return rawRole
    .trim()
    .toLowerCase()
    .replace(/^role_/, '')
    .replace(/[\s-]+/g, '_');
}

export function normalizeRole(rawRole: string | null | undefined): UserRole {
  if (rawRole == null || typeof rawRole !== 'string' || !rawRole.trim()) {
    throw new Error('Login response is missing role');
  }
  const value = normalizeRoleName(rawRole);
  switch (value) {
    case 'system_admin':
      return 'system_admin';
    case 'owner':
    case 'company_admin':
      return 'company_admin';
    case 'store_manager':
      return 'store_manager';
    case 'hr':
    case 'salesperson':
    case 'staff':
      return 'staff';
    default:
      throw new Error(`Unsupported role: ${rawRole}`);
  }
}

export function loginDisplayName(res: LoginResponse): string {
  const parts = [res.firstName?.trim(), res.lastName?.trim()].filter(Boolean);
  if (parts.length) {
    return parts.join(' ');
  }
  return res.username?.trim() || '';
}
