import type { PaginatedApiResponse } from '../../core/api/paginated-api-response';
import type { PaginationRequest } from '../../core/api/pagination-request';

export interface EmployeeRequest {
  name: string;
  email?: string;
  phoneNo: string;
  dateOfBirth?: string;
  address?: string;
  position?: string;
  hireDate?: string;
  payLevel?: string;
  nrc?: string;
  profilePicUrl?: string;
  createUserAccount?: boolean;
  userRole?: string;
  username?: string;
  password?: string;
}

export interface EmployeeDto {
  id: number;
  name: string;
  email?: string | null;
  phoneNo: string;
  dateOfBirth?: string | null;
  address?: string | null;
  position?: string | null;
  hireDate?: string | null;
  payLevel?: string | null;
  nrc?: string | null;
  profilePicUrl?: string | null;
  serviceYear?: number | null;
  shopId?: number | null;
}

export interface EmployeeListRequest extends PaginationRequest {}

export type EmployeeListResponse = PaginatedApiResponse<EmployeeDto>;
