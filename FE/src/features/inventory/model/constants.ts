import { format } from 'date-fns';
import { InventoryPeriodStatus, InventoryPeriodType } from '@/shared/api/model';

export const PERIOD_TYPE_LABELS: Record<string, string> = {
  [InventoryPeriodType.FiveYear]: 'Kiểm kê 5 năm',
  [InventoryPeriodType.Annual]: 'Thống kê hằng năm',
};

export const PERIOD_TYPE_OPTIONS = [
  { value: InventoryPeriodType.Annual, label: PERIOD_TYPE_LABELS[InventoryPeriodType.Annual] },
  { value: InventoryPeriodType.FiveYear, label: PERIOD_TYPE_LABELS[InventoryPeriodType.FiveYear] },
];

export const PERIOD_STATUS_LABELS: Record<string, string> = {
  [InventoryPeriodStatus.Open]: 'Đang mở',
  [InventoryPeriodStatus.Locked]: 'Đã khóa',
};

export const PERIOD_STATUS_COLORS: Record<string, string> = {
  [InventoryPeriodStatus.Open]: 'teal',
  [InventoryPeriodStatus.Locked]: 'gray',
};

export function formatArea(value?: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 5 }).format(value);
}

export function toDateOnlyString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
