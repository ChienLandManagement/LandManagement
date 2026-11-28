import http, { type HttpRequestConfig } from './http';

// Cấu hình request mà orval sinh ra, ánh xạ sang client ky trong ./http.
export interface OrvalRequestConfig {
  url: string;
  method: string;
  data?: unknown;
  params?: object;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  responseType?: 'blob';
}

export const apiOrvalClient = <T>(config: OrvalRequestConfig, options?: HttpRequestConfig): Promise<T> => {
  const { url, data, params, headers, signal, responseType } = config;
  const request: HttpRequestConfig = { params, headers, signal, responseType, ...options };

  switch (config.method.toUpperCase()) {
    case 'POST':
      return http.post<T>(url, data, request);
    case 'PUT':
      return http.put<T>(url, data, request);
    case 'PATCH':
      return http.patch<T>(url, data, request);
    case 'DELETE':
      return http.delete<T>(url, { ...request, data });
    default:
      return http.get<T>(url, request);
  }
};
