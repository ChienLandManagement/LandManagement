import { format, isValid, parseISO } from 'date-fns';

/**
 * Định dạng ngày giờ từ chuỗi ISO UTC hoặc Date sang giờ địa phương.
 * Trả về '—' nếu giá trị null, undefined hoặc không hợp lệ.
 */
export function formatDate(value?: string | Date | null, includeTime = true): string {
  if (!value) {
    return '—';
  }

  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) {
    return '—';
  }

  return format(date, includeTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy');
}
