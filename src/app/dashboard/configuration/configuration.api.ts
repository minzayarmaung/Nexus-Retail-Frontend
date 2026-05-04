import { firstValueFrom } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import type { CodeDto, CodeRequest, CodeValueDto, CodeValueRequest } from './configuration.model';

@Injectable({ providedIn: 'root' })
export class ConfigurationApiService {
  private readonly api = inject(ApiClientService);

  private readonly codesUrl = `${API_BASE_PATH}/configuration/codes`;
  private readonly codeValuesUrl = `${API_BASE_PATH}/configuration/code-values`;

  getAllCodes(): Promise<CodeDto[]> {
    return firstValueFrom(this.api.get<CodeDto[]>(this.codesUrl));
  }

  createCode(req: CodeRequest): Promise<CodeDto> {
    return firstValueFrom(this.api.post<CodeDto>(this.codesUrl, req));
  }

  updateCode(id: number, req: CodeRequest): Promise<CodeDto> {
    return firstValueFrom(this.api.put<CodeDto>(`${this.codesUrl}/${id}`, req));
  }

  deleteCode(id: number): Promise<void> {
    return firstValueFrom(this.api.delete<void>(`${this.codesUrl}/${id}`));
  }

  getCodeValuesByCodeId(codeId: number): Promise<CodeValueDto[]> {
    return firstValueFrom(
      this.api.get<CodeValueDto[]>(`${this.codeValuesUrl}/code/${codeId}`),
    );
  }

  createCodeValue(req: CodeValueRequest): Promise<CodeValueDto> {
    return firstValueFrom(this.api.post<CodeValueDto>(this.codeValuesUrl, req));
  }

  updateCodeValue(id: number, req: CodeValueRequest): Promise<CodeValueDto> {
    return firstValueFrom(this.api.put<CodeValueDto>(`${this.codeValuesUrl}/${id}`, req));
  }

  deleteCodeValue(id: number): Promise<void> {
    return firstValueFrom(this.api.delete<void>(`${this.codeValuesUrl}/${id}`));
  }
}

