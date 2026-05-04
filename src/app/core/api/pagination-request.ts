export interface PaginationRequest {
  keyword?: string;
  page: number;
  size: number;
  sortField?: string;
  sortDirection?: string;
}

