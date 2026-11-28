import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, PasswordInput, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { clearAuth } from '@/entities/session';
import { useChangeMyPassword } from '@/shared/api/generated/api';
import { ROUTES } from '@/shared/config/constants';
import { type ChangePasswordFormValues, changePasswordSchema } from '../model/changePasswordSchema';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { mutateAsync: changePassword, isPending } = useChangeMyPassword();

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePassword({
        data: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });
      notifications.show({
        color: 'green',
        message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại',
      });
      handleClose();
      clearAuth();
      navigate({ to: ROUTES.LOGIN });
    } catch (error) {
      notifications.show({
        color: 'red',
        message: error instanceof Error ? error.message : 'Đổi mật khẩu thất bại',
      });
    }
  };

  return (
    <Modal opened={open} onClose={handleClose} title="Đổi mật khẩu" centered size="md">
      <Text size="sm" c="dimmed" mb="md">
        Sau khi đổi mật khẩu thành công, phiên đăng nhập hiện tại sẽ kết thúc.
      </Text>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap="md">
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                label="Mật khẩu hiện tại"
                autoComplete="current-password"
                error={errors.currentPassword?.message}
              />
            )}
          />
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                label="Mật khẩu mới"
                autoComplete="new-password"
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
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
              />
            )}
          />
          <Group justify="flex-end" mt="xs">
            <Button type="button" variant="default" onClick={handleClose} disabled={isPending}>
              Hủy
            </Button>
            <Button type="submit" loading={isPending}>
              {isPending ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
