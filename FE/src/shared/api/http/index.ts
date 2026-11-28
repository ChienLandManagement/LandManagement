import { notifications } from '@mantine/notifications';
import ky, { type AfterResponseHook, type BeforeErrorHook, type BeforeRequestHook, isKyError } from 'ky';
import { baseKyOptions, createClient, type RequestContext } from './client';
import {
  AuthRetry,
  extractErrorMessage,
  FORBIDDEN_MESSAGE,
  HttpError,
  isAuthError,
  readBody,
  toHttpError,
} from './httpError';

export type { HttpRequestConfig } from './client';
export { HttpError, rejectionMessage } from './httpError';

const showError = (message: string) => notifications.show({ color: 'red', message });

// Lớp phiên (app) đăng ký cách lấy/làm mới token; shared không import ngược lên entities/features.
interface HttpAuthHooks {
  getToken: () => string | null;
  /** Làm mới token, trả token mới; ném lỗi nếu phiên hết hạn. */
  refresh: () => Promise<string>;
}
let auth: HttpAuthHooks | null = null;
export const configureHttpAuth = (hooks: HttpAuthHooks | null): void => {
  auth = hooks;
};

const contextOf = (options: { context: Record<string, unknown> }) => options.context as unknown as RequestContext;

// Gắn token vào header
const attachToken: BeforeRequestHook = ({ request, options }) => {
  if (contextOf(options).skipAuth) return;
  const token = auth?.getToken();
  if (token) request.headers.set('Authorization', `Bearer ${token}`);
};

/**
 * ky chạy hook này cho cả response không phải 2xx, trước khi tự ném HTTPError.
 * Trả `undefined` = để ky xử lý tiếp (HTTPError đi vào `shapeError`).
 * BE trả envelope không nhất quán casing (camelCase hoặc PascalCase tuỳ endpoint).
 */
const afterResponse: AfterResponseHook = async ({ request, options, response }) => {
  const { skipGlobalError, skipAuth, retried, responseType, parsed } = contextOf(options);

  // Blob thành công trả về nguyên vẹn
  if (responseType === 'blob' && response.ok) return;

  const data = responseType === 'blob' ? undefined : await readBody(response);
  parsed.body = data;
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined;
  const envelopeStatus = Number(record?.statusCode ?? record?.StatusCode);

  // 403 business-level trong envelope (HTTP 403 do `shapeError` lo)
  if (response.ok && envelopeStatus === 403) {
    if (!skipGlobalError) showError(FORBIDDEN_MESSAGE);
    throw new HttpError('Forbidden', { errorCode: 403 });
  }

  // 401 (HTTP hoặc envelope): làm mới token (single-flight) rồi để `send` gửi lại một lần.
  // `skipAuth` (login, endpoint công khai): không có phiên để làm mới, 401 đi thẳng thành lỗi.
  if (isAuthError(response.status, data) && !skipAuth && !request.url.includes('/auth/refresh')) {
    if (!retried && auth) {
      await auth.refresh();
      throw new AuthRetry();
    }
  }

  // Lỗi nghiệp vụ trong envelope (HTTP 2xx)
  if (response.ok && record?.isError && envelopeStatus !== 200) {
    const errorText = extractErrorMessage(data, 'Lỗi từ server');
    // 401 envelope bình thường đi qua refresh nên không toast; `skipAuth` không refresh nên vẫn toast.
    if ((envelopeStatus !== 401 || skipAuth) && !skipGlobalError) showError(errorText);
    throw new HttpError(errorText, { errorCode: envelopeStatus });
  }
};

// Lỗi HTTP không phải 2xx, quá giờ, mất mạng. Lỗi không phải của ky (đã là HttpError, lỗi làm mới
// token, huỷ request) đi qua nguyên vẹn, không toast thêm.
const shapeError: BeforeErrorHook = ({ error, options }) => {
  if (!isKyError(error)) return error;
  const httpError = toHttpError(error);
  if (!contextOf(options).skipGlobalError) showError(httpError.message);
  return httpError;
};

/** `fetchImpl`: chỉ để test thay `fetch`. */
export const createHttp = (fetchImpl?: typeof fetch) => {
  const api = ky.create({
    ...baseKyOptions,
    ...(fetchImpl && { fetch: fetchImpl }),
    hooks: {
      beforeRequest: [attachToken],
      afterResponse: [afterResponse],
      beforeError: [shapeError],
    },
  });
  return createClient(api);
};

const http = createHttp();

export default http;
