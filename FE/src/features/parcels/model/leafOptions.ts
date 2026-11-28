import type { LandHolderTypeItem, LandTypeItem } from '@/shared/api/model';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Lọc danh sách loại đất lá:
 * - Bỏ các loại `isMemo`.
 * - Một loại là lá nếu không có con nào, hoặc mọi con của nó đều là `isMemo`.
 */
export function getLeafLandTypeOptions(items: LandTypeItem[]): SelectOption[] {
  const nonMemoParentIds = new Set<string>();
  for (const item of items) {
    if (!item.isMemo && item.parentId) {
      nonMemoParentIds.add(item.parentId);
    }
  }

  return items
    .filter((item) => item.id && !item.isMemo && !nonMemoParentIds.has(item.id))
    .map((item) => ({
      value: item.id ?? '',
      label: `${item.code ?? ''} - ${item.name ?? ''}`.trim(),
    }));
}

/**
 * Lọc danh sách đối tượng sử dụng đất lá (không có con nào trỏ `parentId` tới nó).
 */
export function getLeafLandHolderTypeOptions(items: LandHolderTypeItem[]): SelectOption[] {
  const parentIds = new Set<string>();
  for (const item of items) {
    if (item.parentId) {
      parentIds.add(item.parentId);
    }
  }

  return items
    .filter((item) => item.id && !parentIds.has(item.id))
    .map((item) => ({
      value: item.id ?? '',
      label: `${item.code ?? ''} - ${item.name ?? ''}`.trim(),
    }));
}
