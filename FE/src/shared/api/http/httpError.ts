import { isHTTPError, isNetworkError, isTimeoutError } from 'ky'

export const FORBIDDEN_MESSAGE = 'Bạn không có quyền thực hiện thao tác này.'
const TIMEOUT_MESSAGE = 'Kết nối đến máy chủ quá thời gian. Vui lòng thử lại sau.'
const NETWORK_MESSAGE = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
const FALLBACK_MESSAGE = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'

export type HttpErrorCode = 'ERR_NETWORK' | 'ETIMEDOUT'

interface HttpErrorInit {
  /** Có khi BE trả HTTP không phải 2xx. */
  response?: { status: number; data: unknown }
  /** Có khi lỗi nằm trong envelope (HTTP 2xx, `statusCode` khác 200). */
  errorCode?: number
  code?: HttpErrorCode
}

/**
 * Lỗi duy nhất tầng HTTP ném ra. Giữ các khoá mà code gọi đang đọc:
 * `response.status` / `response.data` (lỗi HTTP), `errorCode` / `errorMessage` (lỗi envelope),
 * `code` (mất mạng, quá giờ). Khoá luôn tồn tại để phép kiểm `'response' in error` nhận ra mọi lỗi của tầng này.
 */
export class HttpError extends Error {
  readonly response: HttpErrorInit['response']
  readonly errorCode: number | undefined
  readonly errorMessage: string
  readonly code: HttpErrorCode | undefined

  constructor(message: string, init: HttpErrorInit = {}) {
    super(message)
    this.name = 'HttpError'
    this.response = init.response
    this.errorCode = init.errorCode
    this.errorMessage = message
    this.code = init.code
  }
}

/**
 * `afterResponse` ném khi đã làm mới token xong. `send` (client.ts) bắt và dựng lại request từ đầu:
 * ky chỉ clone request khi retry > 0 nên không dùng lại được `Request` đã bị đọc body.
 */
export class AuthRetry extends Error {
  constructor() {
    super('Đã làm mới token, gửi lại request')
    this.name = 'AuthRetry'
  }
}

// Message từ envelope BE (object / errorMessage / message, camelCase hoặc PascalCase)
export const extractErrorMessage = (data: unknown, fallbackMessage: string): string => {
  if (!data) return fallbackMessage
  if (typeof data === 'string') return data
  if (typeof data !== 'object') return fallbackMessage
  const record = data as Record<string, unknown>
  const msg =
    (typeof record.object === 'string' ? record.object : null) ??
    (typeof record.Object === 'string' ? record.Object : null) ??
    record.errorMessage ??
    record.ErrorMessage ??
    record.message ??
    record.Message
  return typeof msg === 'string' && msg.trim() ? msg : fallbackMessage
}

/** Body JSON của `response` (chuỗi thô nếu không phải JSON, chuỗi rỗng nếu body rỗng). */
export const readBody = async (response: Response): Promise<unknown> => {
  const text = await response.text()
  if (!text) return text
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// Đổi lỗi của ky (HTTP không phải 2xx, quá giờ, mất mạng) sang HttpError. Không có tác dụng phụ.
export const toHttpError = (error: Error): HttpError => {
  if (isHTTPError(error)) {
    const { status } = error.response
    const message =
      status === 403 ? FORBIDDEN_MESSAGE : extractErrorMessage(error.data, 'Lỗi từ server')
    return new HttpError(message, { response: { status, data: error.data } })
  }
  if (isTimeoutError(error)) return new HttpError(TIMEOUT_MESSAGE, { code: 'ETIMEDOUT' })
  if (isNetworkError(error)) return new HttpError(NETWORK_MESSAGE, { code: 'ERR_NETWORK' })
  return new HttpError(error.message || FALLBACK_MESSAGE)
}

/**
 * Câu BE trả khi từ chối có lý do (mã 4xx: không tìm thấy, sai tham số…). Mã đến qua HTTP status hoặc
 * `statusCode` của envelope (`errorCode`). Lỗi mạng, quá giờ, 5xx trả `undefined`.
 */
export const rejectionMessage = (error: unknown): string | undefined => {
  if (!(error instanceof HttpError)) return undefined
  const status = error.response?.status ?? error.errorCode
  return status !== undefined && status >= 400 && status < 500 ? error.message : undefined
}

// Normalize auth error: HTTP 401 hoặc envelope { statusCode: 401 }.
export const isAuthError = (status: number | undefined, data?: unknown): boolean => {
  if (status === 401) return true
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined
  const envelopeStatus = Number(record?.statusCode ?? record?.StatusCode)
  return envelopeStatus === 401
}
