import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, PasswordInput, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Controller, useForm } from 'react-hook-form';
import { useResetUserPassword } from '@/shared/api/generated/api';
import { HttpError } from '@/shared/api/http';
import type { UserItem } from '@/shared/api/model/userItem';
import { type ResetPasswordFormValues, resetPasswordSchema } from '../model/userSchemas';

interface ResetPasswordDialogProps {
  user: UserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ user, open, onOpenChange }: ResetPasswordDialogProps) {
  const resetPassword = useResetUserPassword();

  const {
    control,
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

  const handleClose = () => {
    reset();
    onOpenChange(false);
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
          notifications.show({ color: 'green', message: 'Đặt lại mật khẩu thành công' });
          handleClose();
        },
        onError: (error: unknown) => {
          const message = error instanceof HttpError ? error.errorMessage : 'Không thể đặt lại mật khẩu';
          notifications.show({ color: 'red', message });
        },
      },
    );
  };

  return (
    <Modal opened={open} onClose={handleClose} title="Đặt lại mật khẩu" centered size="sm">
      <Text size="sm" c="dimmed" mb="md">
        Đặt mật khẩu mới cho tài khoản{' '}
        <Text span fw={600} c="var(--mantine-color-text)">
          {user?.userName}
        </Text>
        .
      </Text>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap="sm">
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                label="Mật khẩu mới"
                placeholder="Ít nhất 8 ký tự"
                error={errors.newPassword?.message}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Group justify="flex-end" mt="xs">
            <Button type="button" variant="default" onClick={handleClose} disabled={resetPassword.isPending}>
              Hủy
            </Button>
            <Button type="submit" loading={resetPassword.isPending}>
              {resetPassword.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
