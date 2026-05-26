/** Backend UserListResponse — note capital `Roles` from Java record. */
export interface UserListResponseDto {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  generatePassword: boolean;
  cannotChangePassword: boolean;
  Roles: string[];
}

export interface UserListItem {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  generatePassword?: boolean;
  cannotChangePassword?: boolean;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  generatePassword: boolean;
  cannotChangePassword: boolean;
  roles: string[];
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  cannotChangePassword?: boolean;
  roles?: string[];
}

export interface UserFormModel {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  generatePassword: boolean;
  cannotChangePassword: boolean;
  roles: string[];
}

export function blankUserForm(): UserFormModel {
  return {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    generatePassword: false,
    cannotChangePassword: false,
    roles: [],
  };
}

export function mapUserListResponse(dto: UserListResponseDto): UserListItem {
  const raw = dto as UserListResponseDto & { roles?: string[] };
  const roles = raw.Roles ?? raw.roles ?? [];
  return {
    id: String(dto.id),
    username: dto.username ?? '',
    firstName: dto.firstName ?? '',
    lastName: dto.lastName ?? '',
    email: dto.email ?? '',
    roles,
    generatePassword: dto.generatePassword,
    cannotChangePassword: dto.cannotChangePassword,
  };
}
