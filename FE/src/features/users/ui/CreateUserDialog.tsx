import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, PasswordInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getListUsersQueryKey, useCreateUser, useListProvinces, useListWards } from '@/shared/api/generated/api';
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
  const [provinceId, setProvinceId] = useState<string | null>(null);

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
      wardId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedRole = watch('role');
  const isAdminRole = watchedRole === 'Admin';

  const { data: provincesData } = useListProvinces(
    { PageSize: 200 },
    { query: { enabled: open && !isAdminRole } },
  );
  const provinces = provincesData?.data?.items ?? [];

  const { data: wardsData } = useListWards(
    { ProvinceId: provinceId ?? undefined, PageSize: 200 },
    { query: { enabled: open && !isAdminRole && Boolean(provinceId) } },
  );
  const wards = wardsData?.data?.items ?? [];

  useEffect(() => {
    if (isAdminRole) {
      setProvinceId(null);
      setValue('wardId', '', { shouldValidate: true });
    }
  }, [isAdminRole, setValue]);

  const handleClose = () => {
    setProvinceId(null);
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
          wardId: values.role === 'Admin' ? null : (values.wardId ?? null),
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

  const provinceOptions = provinces
    .filter((province): province is typeof province & { id: string } => Boolean(province.id))
    .map((province) => ({
      value: province.id,
      label: province.name ?? province.id,
    }));

  const wardOptions = wards
    .filter((ward): ward is typeof ward & { id: string } => Boolean(ward.id))
    .map((ward) => ({
      value: ward.id,
      label: ward.name ?? ward.id,
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
              <TextInput
                {...field}
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                error={errors.fullName?.message}
              />
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
            <>
              <Select
                label="Tỉnh/Thành phố"
                placeholder="Chọn tỉnh/thành phố"
                data={provinceOptions}
                value={provinceId}
                onChange={(val) => {
                  setProvinceId(val);
                  setValue('wardId', '', { shouldValidate: true });
                }}
                clearable
                searchable
              />

              <Controller
                control={control}
                name="wardId"
                render={({ field }) => (
                  <Select
                    label="Xã/Phường"
                    placeholder={provinceId ? 'Chọn xã/phường' : 'Vui lòng chọn tỉnh/thành phố trước'}
                    data={wardOptions}
                    value={field.value || null}
                    onChange={(val) => field.onChange(val ?? '')}
                    disabled={!provinceId}
                    clearable
                    searchable
                    error={errors.wardId?.message}
                  />
                )}
              />
            </>
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
