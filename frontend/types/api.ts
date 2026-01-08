export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

