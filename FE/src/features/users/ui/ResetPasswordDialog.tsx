import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useResetUserPassword } from '@/shared/api/generated/api';
import { HttpError } from '@/shared/api/http';
import type { UserItem } from '@/shared/api/model/userItem';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { type ResetPasswordFormValues, resetPasswordSchema } from '../model/userSchemas';

interface ResetPasswordDialogProps {
  user: UserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ user, open, onOpenChange }: ResetPasswordDialogProps) {
  const resetPassword = useResetUserPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!user?.id) {
      return;
    }

    resetPassword.mutate(
      {
        id: user.id,
        data: {
          newPassword: values.newPassword,
        },
      },
      {
        onSuccess: () => {
          toast.success('Đặt lại mật khẩu thành công');
          handleClose(false);
        },
        onError: (error: unknown) => {
          const message = error instanceof HttpError ? error.errorMessage : 'Không thể đặt lại mật khẩu';
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          <DialogDescription>
            Đặt mật khẩu mới cho tài khoản <span className="font-medium text-foreground">{user?.userName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reset-newPassword">Mật khẩu mới</Label>
            <Input id="reset-newPassword" type="password" placeholder="Ít nhất 8 ký tự" {...register('newPassword')} />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reset-confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="reset-confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={resetPassword.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
