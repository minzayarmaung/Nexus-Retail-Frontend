import type { PaginationMeta } from './pagination-meta';

export interface PaginatedApiResponse<T> {
  success: number;
  code: number;
  message?: string;
  meta: PaginationMeta;
  data: T[];
}

