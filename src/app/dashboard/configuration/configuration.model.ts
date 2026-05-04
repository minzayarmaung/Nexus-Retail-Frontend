export interface CodeRequest {
  codeType: string;
  description?: string;
}

export interface CodeDto {
  id: number;
  codeType: string;
  description?: string | null;
}

export interface CodeValueRequest {
  codeId: number;
  value: string;
  display: string;
  description?: string;
  orderPosition: number;
}

export interface CodeValueDto {
  id: number;
  codeId: number;
  value: string;
  display: string;
  description?: string | null;
  orderPosition: number;
}

