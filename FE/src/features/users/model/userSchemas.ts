import { z } from 'zod';
import { UserRole } from '@/shared/api/model/userRole';

export const USER_ROLES = ['Admin', 'LandOfficer', 'Leader', 'Citizen'] as const;
export type UserRoleKey = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRoleKey, string> = {
  Admin: 'Quản trị viên',
  LandOfficer: 'Cán bộ địa chính',
  Leader: 'Lãnh đạo',
  Citizen: 'Người dân',
};

export function toUserRoleValue(role: UserRoleKey): UserRole {
  return UserRole[role];
}

export function isUserRoleKey(value?: string | null): value is UserRoleKey {
  return value != null && (USER_ROLES as readonly string[]).includes(value);
}

const optionalEmailSchema = z
  .string()
  .trim()
  .transform((val) => (val === '' ? undefined : val))
  .pipe(z.string().email('Email không hợp lệ').optional());

const wardIdsSchema = z.array(z.string()).default([]);

export const createUserSchema = z
  .object({
    userName: z
      .string()
      .trim()
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .max(100, 'Tên đăng nhập tối đa 100 ký tự')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Tên đăng nhập chỉ được chứa chữ không dấu, số, dấu chấm, gạch dưới và gạch ngang'),
    fullName: z.string().trim().min(1, 'Họ và tên không được để trống'),
    email: optionalEmailSchema,
    role: z.enum(USER_ROLES, { error: 'Vui lòng chọn vai trò' }),
    wardIds: wardIdsSchema,
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').max(128, 'Mật khẩu tối đa 128 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.role !== 'Admin' && data.wardIds.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Vui lòng chọn ít nhất một xã/phường',
        path: ['wardIds'],
      });
    }
  });

export type CreateUserFormValues = z.input<typeof createUserSchema>;
export type CreateUserSubmitValues = z.output<typeof createUserSchema>;

export const editUserSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Họ và tên không được để trống'),
    email: optionalEmailSchema,
    role: z.enum(USER_ROLES, { error: 'Vui lòng chọn vai trò' }),
    wardIds: wardIdsSchema,
  })
  .superRefine((data, ctx) => {
    if (data.role !== 'Admin' && data.wardIds.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Vui lòng chọn ít nhất một xã/phường',
        path: ['wardIds'],
      });
    }
  });

export type EditUserFormValues = z.input<typeof editUserSchema>;
export type EditUserSubmitValues = z.output<typeof editUserSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự').max(128, 'Mật khẩu mới tối đa 128 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
