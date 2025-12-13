import type { ApiResponse } from '../types';

export function unwrap<T>(resp: { data: ApiResponse<T> }): T {
  const body = resp.data as ApiResponse<T>;
  if (body?.success) return body.data as T;
  const message = (body as any)?.error || 'Request failed';
  throw new Error(message);
}
