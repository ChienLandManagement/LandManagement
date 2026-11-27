/**
 * Chuẩn hoá và serialize query parameters cho client HTTP gửi lên ASP.NET Core Web API:
 * 1. Bỏ qua các giá trị `undefined`, `null`, `""` (chuỗi rỗng hoặc toàn khoảng trắng).
 * 2. Tự động chuyển alias `page` thành `currentPage` theo chuẩn PaginationRequest của BE.
 * 3. Giữ nguyên các giá trị hợp lệ: số `0`, boolean `false`.
 * 4. Mảng (Array): lặp key theo chuẩn ASP.NET Core `[FromQuery] List<T>` (ví dụ `status=1&status=2`).
 * 5. Hỗ trợ Date / Dayjs: chuyển sang ISO string.
 */
export function serializeQueryParams(params: object): string {
  if (!params || typeof params !== 'object') return ''

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && value.trim() === '') continue

    // Tự động map 'page' -> 'currentPage' cho các component/hook truyền page
    if (key === 'page' && 'currentPage' in params) continue
    const effectiveKey = key === 'page' ? 'currentPage' : key

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue
        if (typeof item === 'string' && item.trim() === '') continue
        searchParams.append(effectiveKey, String(item))
      }
    } else if (value instanceof Date) {
      searchParams.set(effectiveKey, value.toISOString())
    } else if (
      typeof value === 'object' &&
      value !== null &&
      'toISOString' in value &&
      typeof (value as { toISOString: () => string }).toISOString === 'function'
    ) {
      // Hỗ trợ Dayjs hoặc object có toISOString()
      searchParams.set(effectiveKey, (value as { toISOString: () => string }).toISOString())
    } else {
      searchParams.set(effectiveKey, String(value))
    }
  }

  return searchParams.toString()
}
