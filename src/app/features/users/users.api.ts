import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import type { ApiResponse } from '../../core/api/api-response';
import { ApiClientService } from '../../core/api/api-client.service';
import type { UserCreateRequest, UserListResponseDto, UserUpdateRequest } from './users.model';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiClientService);
  private readonly usersUrl = `${API_BASE_PATH}/users`;
  private readonly authUrl = `${API_BASE_PATH}/auth`;

  getAllUsers(): Promise<UserListResponseDto[]> {
    return firstValueFrom(this.api.get<UserListResponseDto[]>(this.usersUrl));
  }

  createUser(payload: UserCreateRequest): Promise<void> {
    return firstValueFrom(
      this.http.post<ApiResponse<unknown>>(this.usersUrl, payload).pipe(
        map((res) => {
          const ok = !!res && (res.success === 1 || res.code === 0 || res.code === 201);
          if (!ok) {
            throw new Error(res?.message ?? 'Request failed');
          }
        }),
      ),
    );
  }

  updateUser(id: number, payload: UserUpdateRequest): Promise<unknown> {
    return firstValueFrom(
      this.http
        .patch<ApiResponse<unknown>>(`${this.usersUrl}/${id}`, payload)
        .pipe(map((res) => this.unwrapMessage(res))),
    );
  }

  /** Returns true if username already exists. */
  checkUsername(username: string): Promise<boolean> {
    const params = new HttpParams().set('username', username.trim());
    return firstValueFrom(
      this.http.get<boolean>(`${this.usersUrl}/check-username`, { params }),
    );
  }

  generatePassword(username: string): Promise<string> {
    const params = new HttpParams().set('username', username.trim());
    return firstValueFrom(
      this.http.get(`${this.usersUrl}/generate-password`, {
        params,
        responseType: 'text',
      }),
    );
  }

  suspendUser(id: number): Promise<string> {
    return firstValueFrom(
      this.http.post(`${this.usersUrl}/suspend/${id}`, null, { responseType: 'text' }),
    );
  }

  deleteUserById(id: number): Promise<string> {
    return firstValueFrom(
      this.http.delete(`${this.usersUrl}/${id}`, { responseType: 'text' }),
    );
  }

  changePassword(userId: number, newPassword: string): Promise<unknown> {
    const params = new HttpParams().set('newPassword', newPassword);
    return firstValueFrom(
      this.http
        .patch<ApiResponse<unknown>>(`${this.authUrl}/change-password/${userId}`, null, { params })
        .pipe(map((res) => this.unwrapMessage(res))),
    );
  }

  private unwrapMessage(res: ApiResponse<unknown>): unknown {
    const isSuccess = !!res && (res.success === 1 || res.code === 0);
    if (!isSuccess) {
      throw new Error(res?.message ?? 'Request failed');
    }
    return res.data;
  }

}
