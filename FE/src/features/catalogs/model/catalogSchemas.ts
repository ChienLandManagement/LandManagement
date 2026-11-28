import { z } from 'zod';
import { LandHolderKind } from '@/shared/api/model';

export const landTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã loại đất')
    .max(10, 'Mã loại đất tối đa 10 ký tự'),
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên loại đất')
    .max(255, 'Tên loại đất tối đa 255 ký tự'),
  parentId: z.string().nullable().optional(),
  sortOrder: z
    .number({ message: 'Thứ tự phải là số nguyên' })
    .int('Thứ tự phải là số nguyên')
    .min(0, 'Thứ tự không được âm')
    .optional(),
  inB02: z.boolean(),
  inB05: z.boolean(),
});

export type LandTypeFormValues = z.infer<typeof landTypeSchema>;

export const landHolderTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã đối tượng')
    .max(10, 'Mã đối tượng tối đa 10 ký tự'),
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên đối tượng')
    .max(255, 'Tên đối tượng tối đa 255 ký tự'),
  parentId: z.string().nullable().optional(),
  sortOrder: z
    .number({ message: 'Thứ tự phải là số nguyên' })
    .int('Thứ tự phải là số nguyên')
    .min(0, 'Thứ tự không được âm')
    .optional(),
  kind: z.enum(['User', 'Manager'], { message: 'Vui lòng chọn nhóm đối tượng' }),
});

export type LandHolderTypeFormValues = z.infer<typeof landHolderTypeSchema>;

export const LAND_HOLDER_KIND_OPTIONS = [
  { value: 'User', label: 'Người sử dụng đất' },
  { value: 'Manager', label: 'Người được giao quản lý' },
];

export const LAND_HOLDER_KIND_LABELS: Record<string, string> = {
  User: 'Người sử dụng đất',
  Manager: 'Người được giao quản lý',
};

export function toLandHolderKind(kind: 'User' | 'Manager'): LandHolderKind {
  return kind === 'User' ? LandHolderKind.User : LandHolderKind.Manager;
}
