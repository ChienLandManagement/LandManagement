import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, MultiSelect, PasswordInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getListUsersQueryKey, useCreateUser, useListWards } from '@/shared/api/generated/api';
import { HttpError } from '@/shared/api/http';
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
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormValues, unknown, CreateUserSubmitValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      userName: '',
      fullName: '',
      email: '',
      role: 'LandOfficer',
      wardIds: [],
      password: '',
      confirmPassword: '',
    },
  });

  const watchedRole = watch('role');
  const isAdminRole = watchedRole === 'Admin';

  const { data: wardsData } = useListWards({ PageSize: 100 }, { query: { enabled: open && !isAdminRole } });
  const wards = wardsData?.data?.items ?? [];

  useEffect(() => {
    if (isAdminRole) {
      setValue('wardIds', [], { shouldValidate: true });
    }
  }, [isAdminRole, setValue]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (values: CreateUserSubmitValues) => {
    createUser.mutate(
      {
        data: {
          userName: values.userName,
          fullName: values.fullName,
          email: values.email ?? null,
          role: toUserRoleValue(values.role),
          wardIds: values.role === 'Admin' ? [] : values.wardIds,
          password: values.password,
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          notifications.show({ color: 'green', message: 'Tạo tài khoản thành công' });
          handleClose();
        },
        onError: (error: unknown) => {
          const message = error instanceof HttpError ? error.errorMessage : 'Không thể tạo tài khoản';
          notifications.show({ color: 'red', message });
        },
      },
    );
  };

  const roleOptions = USER_ROLES.map((roleKey) => ({
    value: roleKey,
    label: USER_ROLE_LABELS[roleKey],
  }));

  const wardOptions = wards
    .filter((ward): ward is typeof ward & { id: string } => Boolean(ward.id))
    .map((ward) => ({
      value: ward.id,
      label: ward.provinceName ? `${ward.name} (${ward.provinceName})` : (ward.name ?? ward.id),
    }));

  return (
    <Modal opened={open} onClose={handleClose} title="Tạo tài khoản mới" centered size="md">
      <Text size="sm" c="dimmed" mb="md">
        Nhập thông tin để cấp tài khoản người dùng mới trong hệ thống.
      </Text>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap="sm">
          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Tên đăng nhập"
                placeholder="vd: nguyen.van.a"
                error={errors.userName?.message}
              />
            )}
          />

          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextInput {...field} label="Họ và tên" placeholder="Nguyễn Văn A" error={errors.fullName?.message} />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                value={field.value ?? ''}
                type="email"
                label="Email (không bắt buộc)"
                placeholder="example@domain.com"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                label="Vai trò"
                placeholder="Chọn vai trò"
                data={roleOptions}
                value={field.value}
                onChange={(val) => field.onChange(val ?? 'LandOfficer')}
                allowDeselect={false}
                error={errors.role?.message}
              />
            )}
          />

          {!isAdminRole && (
            <Controller
              control={control}
              name="wardIds"
              render={({ field }) => (
                <MultiSelect
                  label="Xã/Phường được phân công"
                  placeholder="Chọn một hoặc nhiều xã/phường"
                  data={wardOptions}
                  value={field.value}
                  onChange={field.onChange}
                  searchable
                  clearable
                  error={errors.wardIds?.message}
                />
              )}
            />
          )}

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                label="Mật khẩu"
                placeholder="Ít nhất 8 ký tự"
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Group justify="flex-end" mt="xs">
            <Button type="button" variant="default" onClick={handleClose} disabled={createUser.isPending}>
              Hủy
            </Button>
            <Button type="submit" loading={createUser.isPending}>
              {createUser.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
