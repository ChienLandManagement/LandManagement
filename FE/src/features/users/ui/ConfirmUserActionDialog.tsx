import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getListUsersQueryKey, useDeleteUser, useSetUserActive } from '@/shared/api/generated/api';
import { HttpError } from '@/shared/api/http';
import type { UserItem } from '@/shared/api/model/userItem';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';

export type UserConfirmActionType = 'lock' | 'unlock' | 'delete';

interface ConfirmUserActionDialogProps {
  user: UserItem | null;
  action: UserConfirmActionType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_CONFIG: Record<
  UserConfirmActionType,
  {
    title: string;
    description: (userName: string) => string;
    confirmLabel: string;
    successMessage: string;
    variant: 'default' | 'destructive';
  }
> = {
  lock: {
    title: 'Khóa tài khoản',
    description: (userName) => `Bạn có chắc chắn muốn khóa tài khoản "${userName}"? Người dùng sẽ không thể đăng nhập.`,
    confirmLabel: 'Khóa tài khoản',
    successMessage: 'Đã khóa tài khoản',
    variant: 'destructive',
  },
  unlock: {
    title: 'Mở khóa tài khoản',
    description: (userName) => `Bạn có chắc chắn muốn mở khóa tài khoản "${userName}"?`,
    confirmLabel: 'Mở khóa',
    successMessage: 'Đã mở khóa tài khoản',
    variant: 'default',
  },
  delete: {
    title: 'Xóa tài khoản',
    description: (userName) => `Bạn có chắc chắn muốn xóa tài khoản "${userName}"? Hành động này không thể hoàn tác.`,
    confirmLabel: 'Xóa tài khoản',
    successMessage: 'Đã xóa tài khoản',
    variant: 'destructive',
  },
};

export function ConfirmUserActionDialog({ user, action, open, onOpenChange }: ConfirmUserActionDialogProps) {
  const queryClient = useQueryClient();
  const setUserActive = useSetUserActive();
  const deleteUser = useDeleteUser();

  if (!user || !action) {
    return null;
  }

  const config = ACTION_CONFIG[action];
  const isPending = setUserActive.isPending || deleteUser.isPending;

  const handleConfirm = () => {
    if (!user.id) {
      return;
    }

    const onSuccess = () => {
      void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast.success(config.successMessage);
      onOpenChange(false);
    };

    const onError = (error: unknown) => {
      const message = error instanceof HttpError ? error.errorMessage : 'Thao tác thất bại';
      toast.error(message);
    };

    if (action === 'delete') {
      deleteUser.mutate({ id: user.id }, { onSuccess, onError });
      return;
    }

    setUserActive.mutate(
      {
        id: user.id,
        data: { isActive: action === 'unlock' },
      },
      { onSuccess, onError },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description(user.userName ?? '')}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button type="button" variant={config.variant} onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'Đang xử lý...' : config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
