import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getListUsersQueryKey, useUpdateUser } from '@/shared/api/generated/api';
import { HttpError } from '@/shared/api/http';
import type { UserItem } from '@/shared/api/model/userItem';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  type EditUserFormValues,
  type EditUserSubmitValues,
  editUserSchema,
  isUserRoleKey,
  toUserRoleValue,
  USER_ROLE_LABELS,
  USER_ROLES,
} from '../model/userSchemas';

interface EditUserDialogProps {
  user: UserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCurrentUser?: boolean;
}

export function EditUserDialog({ user, open, onOpenChange, isCurrentUser = false }: EditUserDialogProps) {
  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues, unknown, EditUserSubmitValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'LandOfficer',
    },
  });

  useEffect(() => {
    if (user && open) {
      reset({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        role: isUserRoleKey(user.role) ? user.role : 'LandOfficer',
      });
    }
  }, [user, open, reset]);

  const onSubmit = (values: EditUserSubmitValues) => {
    if (!user?.id) {
      return;
    }

    updateUser.mutate(
      {
        id: user.id,
        data: {
          fullName: values.fullName,
          email: values.email ?? null,
          role: toUserRoleValue(values.role),
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast.success('Cập nhật tài khoản thành công');
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          const message = error instanceof HttpError ? error.errorMessage : 'Không thể cập nhật tài khoản';
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho tài khoản <span className="font-medium text-foreground">{user?.userName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-fullName">Họ và tên</Label>
            <Input id="edit-fullName" placeholder="Nguyễn Văn A" {...register('fullName')} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email (không bắt buộc)</Label>
            <Input id="edit-email" type="email" placeholder="example@domain.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Vai trò</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isCurrentUser}>
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
            {isCurrentUser && (
              <p className="text-xs text-muted-foreground">Không thể tự thay đổi vai trò của chính mình.</p>
            )}
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateUser.isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
