import { inject, Injectable, signal } from '@angular/core';
import {
  mapUserListResponse,
  type UserCreateRequest,
  type UserListItem,
  type UserUpdateRequest,
} from './users.model';
import { UsersApiService } from './users.api';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly usersApi = inject(UsersApiService);

  private readonly _users = signal<UserListItem[]>([]);
  readonly users = this._users.asReadonly();

  readonly loadState = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly loadError = signal<string | null>(null);

  private readonly detailCache = new Map<string, UserListItem>();

  async loadUsers(): Promise<void> {
    this.loadState.set('loading');
    this.loadError.set(null);
    try {
      const dtos = await this.usersApi.getAllUsers();
      const items = dtos.map(mapUserListResponse);
      this._users.set(items);
      this.detailCache.clear();
      for (const u of items) {
        this.detailCache.set(u.id, u);
      }
      this.loadState.set('ready');
    } catch (e) {
      this.loadError.set(e instanceof Error ? e.message : 'Failed to load users');
      this.loadState.set('error');
      this._users.set([]);
    }
  }

  getCachedUser(id: string): UserListItem | undefined {
    return this.detailCache.get(id) ?? this._users().find((u) => u.id === id);
  }

  async loadUserDetail(id: string): Promise<UserListItem> {
    const cached = this.getCachedUser(id);
    if (cached) {
      return cached;
    }
    await this.loadUsers();
    const found = this.getCachedUser(id);
    if (!found) {
      throw new Error('User not found');
    }
    return found;
  }

  async createUser(payload: UserCreateRequest, options?: { refreshList?: boolean }): Promise<void> {
    await this.usersApi.createUser(payload);
    if (options?.refreshList !== false) {
      await this.refreshUsersSilently();
    }
  }

  async updateUser(id: string, payload: UserUpdateRequest): Promise<void> {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      throw new Error('Invalid user id');
    }
    await this.usersApi.updateUser(numericId, payload);
    this.detailCache.delete(id);
    await this.refreshUsersSilently();
  }

  /** Refreshes the user list without failing the caller (e.g. after create). */
  async refreshUsersSilently(): Promise<void> {
    try {
      await this.loadUsers();
    } catch {
      /* create/update already succeeded */
    }
  }

  async checkUsernameTaken(username: string): Promise<boolean> {
    return this.usersApi.checkUsername(username);
  }

  async generatePassword(username: string): Promise<string> {
    return this.usersApi.generatePassword(username);
  }

    async suspendUser(id: string): Promise<string> {
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        throw new Error('Invalid user id');
      }
      const msg = await this.usersApi.suspendUser(numericId);
      this.detailCache.delete(id);
      this._users.update((list) => list.filter((u) => u.id !== id));
      return msg;
    }

  async deleteUserById(id: string): Promise<string> {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      throw new Error('Invalid user id');
    }
    const msg = await this.usersApi.deleteUserById(numericId);
    this.detailCache.delete(id);
    this._users.update((list) => list.filter((u) => u.id !== id));
    return msg;
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const numericId = Number(userId);
    if (!Number.isFinite(numericId)) {
      throw new Error('Invalid user id');
    }
    await this.usersApi.changePassword(numericId, newPassword);
  }
}
