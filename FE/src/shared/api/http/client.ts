import type { KyInstance, Options } from 'ky';

import { env } from '@/shared/config/env';
import type { ApiResponse } from '@/shared/types/api';
import { AuthRetry, readBody } from './httpError';
import { serializeQueryParams } from './paramsSerializer';

export interface HttpRequestConfig {
  params?: object;
  /** Body của DELETE. */
  data?: unknown;
  headers?: Record<string, string>;
  /** `blob`: trả `HttpBlobResponse`, không bóc envelope. */
  responseType?: 'blob';
  /** Bỏ toast lỗi chung; màn tự hiển thị lỗi. */
  skipGlobalError?: boolean;
  /** Endpoint công khai: không gắn Authorization. */
  skipAuth?: boolean;
  signal?: AbortSignal;
}

export interface HttpBlobResponse {
  data: Blob;
  /** Tên header viết thường. */
  headers: Record<string, string>;
  status: number;
}

/** Cờ riêng của từng request, đi qua `context` của ky để hook đọc. */
export interface RequestContext {
  skipGlobalError?: boolean;
  skipAuth?: boolean;
  responseType?: 'blob';
  /** Đã làm mới token và gửi lại một lần. */
  retried?: boolean;
  /** `afterResponse` đã đọc body thì ghi vào đây để `send` không parse lần hai. */
  parsed: { body?: unknown };
}

/** Mặc định chung của client chính và client bare. `retry: 0` vì gửi lại POST có thể ghi trùng. */
export const baseKyOptions: Options = {
  ...(env.VITE_API_URL ? { prefix: env.VITE_API_URL } : {}),
  timeout: 60000,
  retry: 0,
  credentials: 'include',
};

const ABSOLUTE_URL = /^[a-z][a-z\d+.-]*:\/\//i;

const withoutContentType = (headers: Record<string, string>) =>
  Object.fromEntries(Object.entries(headers).filter(([name]) => name.toLowerCase() !== 'content-type'));

/**
 * Bọc `KyInstance` theo chữ ký mà tầng feature đang gọi: `get/delete(url, config)`,
 * `post/put/patch(url, body, config)`. Trả thẳng body envelope (không phải response).
 */
export const createClient = (api: KyInstance) => {
  const send = async <T>(method: string, url: string, body: unknown, config: HttpRequestConfig = {}): Promise<T> => {
    const { params, headers, responseType, skipGlobalError, skipAuth, signal } = config;
    const isForm = body instanceof FormData;
    const parsed: RequestContext['parsed'] = {};
    // Mỗi lần gọi dựng request mới từ body gốc (JSON stringify lại, FormData dùng lại)
    const attempt = (retried: boolean) =>
      api(url, {
        method,
        // URL tuyệt đối không được nối `prefix`
        ...(ABSOLUTE_URL.test(url) ? { prefix: '' } : {}),
        // FormData: để trình duyệt tự gắn Content-Type kèm boundary
        ...(isForm ? { body } : body === undefined ? {} : { json: body }),
        searchParams: params ? serializeQueryParams(params) : undefined,
        headers: headers && isForm ? withoutContentType(headers) : headers,
        signal,
        context: {
          skipGlobalError,
          skipAuth,
          responseType,
          retried,
          parsed,
        } satisfies RequestContext,
      });
    const response = await attempt(false).catch((error: unknown) => {
      if (error instanceof AuthRetry) return attempt(true);
      throw error;
    });

    if (responseType === 'blob') {
      const blobResponse: HttpBlobResponse = {
        data: await response.blob(),
        headers: Object.fromEntries(response.headers),
        status: response.status,
      };
      return blobResponse as T;
    }
    return ('body' in parsed ? parsed.body : await readBody(response)) as T;
  };

  return {
    get: <T = ApiResponse>(url: string, config?: HttpRequestConfig) => send<T>('GET', url, undefined, config),
    delete: <T = ApiResponse>(url: string, config?: HttpRequestConfig) => send<T>('DELETE', url, config?.data, config),
    post: <T = ApiResponse>(url: string, body?: unknown, config?: HttpRequestConfig) =>
      send<T>('POST', url, body, config),
    put: <T = ApiResponse>(url: string, body?: unknown, config?: HttpRequestConfig) =>
      send<T>('PUT', url, body, config),
    patch: <T = ApiResponse>(url: string, body?: unknown, config?: HttpRequestConfig) =>
      send<T>('PATCH', url, body, config),
  };
};

export type HttpClient = ReturnType<typeof createClient>;
