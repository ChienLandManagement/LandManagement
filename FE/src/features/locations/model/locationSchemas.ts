import { z } from 'zod';

export const provinceSchema = z.object({
  provinceCode: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã tỉnh/thành phố')
    .max(2, 'Mã tỉnh/thành phố tối đa 2 ký tự'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên tỉnh/thành phố'),
  shortName: z.string().trim().optional(),
  placeType: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export type ProvinceFormValues = z.infer<typeof provinceSchema>;

export const wardSchema = z.object({
  wardCode: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã xã/phường')
    .max(6, 'Mã xã/phường tối đa 6 ký tự'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên xã/phường'),
  provinceId: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
});

export type WardFormValues = z.infer<typeof wardSchema>;

export const PLACE_TYPE_OPTIONS = [
  { value: 'Tỉnh', label: 'Tỉnh' },
  { value: 'Thành phố', label: 'Thành phố' },
];
