export type UserRole = 'system_admin' | 'company_admin' | 'store_manager' | 'staff';

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarId: string;
}
