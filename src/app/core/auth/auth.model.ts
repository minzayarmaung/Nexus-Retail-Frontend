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
  role: string;
  userId: string | number;
}

export function normalizeRole(rawRole: string): UserRole {
  const value = rawRole
    .trim()
    .toLowerCase()
    .replace(/^role_/, '')
    .replace(/[\s-]+/g, '_');
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

