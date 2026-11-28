import { Button, Group, Modal, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { getListUsersQueryKey, useDeleteUser, useSetUserActive } from '@/shared/api/generated/api';
import { HttpError } from '@/shared/api/http';
import type { UserItem } from '@/shared/api/model/userItem';

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
    color: 'red' | 'green';
  }
> = {
  lock: {
    title: 'Khóa tài khoản',
    description: (userName) => `Bạn có chắc chắn muốn khóa tài khoản "${userName}"? Người dùng sẽ không thể đăng nhập.`,
    confirmLabel: 'Khóa tài khoản',
    successMessage: 'Đã khóa tài khoản',
    color: 'red',
  },
  unlock: {
    title: 'Mở khóa tài khoản',
    description: (userName) => `Bạn có chắc chắn muốn mở khóa tài khoản "${userName}"?`,
    confirmLabel: 'Mở khóa',
    successMessage: 'Đã mở khóa tài khoản',
    color: 'green',
  },
  delete: {
    title: 'Xóa tài khoản',
    description: (userName) => `Bạn có chắc chắn muốn xóa tài khoản "${userName}"? Hành động này không thể hoàn tác.`,
    confirmLabel: 'Xóa tài khoản',
    successMessage: 'Đã xóa tài khoản',
    color: 'red',
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
      notifications.show({ color: 'green', message: config.successMessage });
      onOpenChange(false);
    };

    const onError = (error: unknown) => {
      const message = error instanceof HttpError ? error.errorMessage : 'Thao tác thất bại';
      notifications.show({ color: 'red', message });
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
    <Modal opened={open} onClose={() => onOpenChange(false)} title={config.title} centered size="sm">
      <Text size="sm" c="dimmed" mb="lg">
        {config.description(user.userName ?? '')}
      </Text>

      <Group justify="flex-end">
        <Button type="button" variant="default" onClick={() => onOpenChange(false)} disabled={isPending}>
          Hủy
        </Button>
        <Button type="button" color={config.color} onClick={handleConfirm} loading={isPending}>
          {isPending ? 'Đang xử lý...' : config.confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
