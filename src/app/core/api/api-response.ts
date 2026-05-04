export interface ApiResponse<T = unknown> {
  /** 1 for success, 0 for failure */
  success: number;
  /** HTTP status code */
  code: number;
  /** Additional metadata */
  meta?: Record<string, unknown>;
  /** Response data payload */
  data: T;
  /** Response message */
  message?: string;
}

