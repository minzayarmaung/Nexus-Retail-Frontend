import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import { ApiClientService } from '../../core/api/api-client.service';
import type { EmployeeDto, EmployeeRequest } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = `${API_BASE_PATH}/employees`;

  create(payload: EmployeeRequest): Promise<EmployeeDto> {
    return firstValueFrom(this.api.post<EmployeeDto>(this.baseUrl, payload, { withCredentials: true }));
  }

  getAll(): Promise<EmployeeDto[]> {
    return firstValueFrom(this.api.get<EmployeeDto[]>(this.baseUrl, { withCredentials: true }));
  }

  getById(id: number): Promise<EmployeeDto> {
    return firstValueFrom(this.api.get<EmployeeDto>(`${this.baseUrl}/${id}`, { withCredentials: true }));
  }

  update(id: number, payload: EmployeeRequest): Promise<EmployeeDto> {
    return firstValueFrom(this.api.put<EmployeeDto>(`${this.baseUrl}/${id}`, payload, { withCredentials: true }));
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(this.api.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true }));
  }
}

