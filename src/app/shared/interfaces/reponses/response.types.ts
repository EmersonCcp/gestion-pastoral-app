export type ISODate = string; // e.g. '2025-08-18T17:03:25.123Z'
export interface ApiMeta {
  requestId?: string;
  timestamp: ISODate;
  path?: string;
  version?: string; // e.g. 'v1'
}
export interface ApiError {
  code: string; // 'VALIDATION_ERROR' | 'NOT_FOUND' | ...
  message: string;
  details?: any; // campos inválidos, hints, etc.
}
export interface ApiPage {
  page: number; // 1-based
  per_page: number;
  total_items: number;
  total_pages: number; // ceil(total_items/per_page)
}
export interface ApiListMeta extends ApiMeta {
  paging?: ApiPage;
  sort?: { by: string; dir: 'asc' | 'desc' }[];
  filter?: Record<string, any>;
  filters?: Record<string, any>;
}
export interface ApiResponse<T> {
  ok: true;
  data: T;
  meta: ApiMeta;
  message?: string;
}
export interface ApiListResponse<T> {
  ok: true;
  data: T[];
  meta: ApiListMeta;
}
export interface ApiErrorResponse {
  ok: false;
  data?: null;
  error: ApiError;
  meta: ApiMeta;
}