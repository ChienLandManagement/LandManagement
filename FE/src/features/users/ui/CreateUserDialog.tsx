import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getListUsersQueryKey, useCreateUser } from '@/shared/api/generated/api';
import { HttpError } from '@/shared/api/http';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  type CreateUserFormValues,
  type CreateUserSubmitValues,
  createUserSchema,
  toUserRoleValue,
  USER_ROLE_LABELS,
  USER_ROLES,
} from '../model/userSchemas';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const queryClient = useQueryClient();
  const createUser = useCreateUser();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues, unknown, CreateUserSubmitValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      userName: '',
      fullName: '',
      email: '',
      role: 'LandOfficer',
      password: '',
      confirmPassword: '',
    },
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = (values: CreateUserSubmitValues) => {
    createUser.mutate(
      {
        data: {
          userName: values.userName,
          fullName: values.fullName,
          email: values.email ?? null,
          role: toUserRoleValue(values.role),
          password: values.password,
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast.success('Tạo tài khoản thành công');
          handleClose(false);
        },
        onError: (error: unknown) => {
          const message = error instanceof HttpError ? error.errorMessage : 'Không thể tạo tài khoản';
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản mới</DialogTitle>
          <DialogDescription>Nhập thông tin để cấp tài khoản người dùng mới trong hệ thống.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="create-userName">Tên đăng nhập</Label>
            <Input id="create-userName" placeholder="vd: nguyen.van.a" {...register('userName')} />
            {errors.userName && <p className="text-xs text-destructive">{errors.userName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-fullName">Họ và tên</Label>
            <Input id="create-fullName" placeholder="Nguyễn Văn A" {...register('fullName')} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-email">Email (không bắt buộc)</Label>
            <Input id="create-email" type="email" placeholder="example@domain.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Vai trò</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((roleKey) => (
                      <SelectItem key={roleKey} value={roleKey}>
                        {USER_ROLE_LABELS[roleKey]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-password">Mật khẩu</Label>
            <Input id="create-password" type="password" placeholder="Ít nhất 8 ký tự" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="create-confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={createUser.isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
