import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Modal, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { setAuth } from '@/entities/session';
import { ROUTES } from '@/shared/config/constants';
import { loginApi } from '../api/authApi';

const schema = z.object({
  userName: z.string().trim().min(1, 'Nhập tên đăng nhập'),
  password: z.string().min(1, 'Nhập mật khẩu'),
});

type FormValues = z.infer<typeof schema>;

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { userName: '', password: '' },
  });

  const handleClose = () => {
    setError(null);
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const { user, accessToken } = await loginApi(values);
      setAuth(user, accessToken);
      handleClose();
      navigate({ to: ROUTES.HOME });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đăng nhập thất bại');
    }
  };

  return (
    <Modal opened={open} onClose={handleClose} withCloseButton={false} centered size="md" padding="xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Stack gap={4} align="center" mb="xs">
            <Title order={2} ta="center" fw={800} c="var(--mantine-primary-color-filled)">
              Đăng nhập
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              Hệ thống quản lý đất đai cấp xã
            </Text>
          </Stack>
          {error && (
            <Alert color="red" variant="light" icon={<AlertCircle size={16} />}>
              {error}
            </Alert>
          )}

          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập"
                size="md"
                leftSection={<User size={16} />}
                error={errors.userName?.message}
                autoFocus
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                size="md"
                leftSection={<Lock size={16} />}
                error={errors.password?.message}
              />
            )}
          />

          <Button type="submit" loading={isSubmitting} size="md" fullWidth mt="xs">
            Đăng nhập
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
