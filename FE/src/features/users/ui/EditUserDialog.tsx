import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, Select, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getListUsersQueryKey, useListProvinces, useListWards, useUpdateUser } from '@/shared/api/generated/api';
import { HttpError } from '@/shared/api/http';
import type { UserItem } from '@/shared/api/model/userItem';
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
  const [provinceId, setProvinceId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditUserFormValues, unknown, EditUserSubmitValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'LandOfficer',
      wardId: '',
    },
  });

  const watchedRole = watch('role');
  const isAdminRole = watchedRole === 'Admin';

  const { data: provincesData } = useListProvinces(
    { PageSize: 100 },
    { query: { enabled: open && !isAdminRole } },
  );
  const provinces = provincesData?.data?.items ?? [];

  const { data: wardsData } = useListWards(
    { ProvinceId: provinceId ?? undefined, PageSize: 100 },
    { query: { enabled: open && !isAdminRole } },
  );
  const wards = wardsData?.data?.items ?? [];

  useEffect(() => {
    if (isAdminRole) {
      setProvinceId(null);
      setValue('wardId', '', { shouldValidate: true });
    }
  }, [isAdminRole, setValue]);

  useEffect(() => {
    if (user && open) {
      setProvinceId(user.provinceId ?? null);
      reset({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        role: isUserRoleKey(user.role) ? user.role : 'LandOfficer',
        wardId: user.wardId ?? '',
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
          wardId: values.role === 'Admin' ? null : (values.wardId ?? null),
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          notifications.show({ color: 'green', message: 'Cập nhật tài khoản thành công' });
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          const message = error instanceof HttpError ? error.errorMessage : 'Không thể cập nhật tài khoản';
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
    <Modal opened={open} onClose={() => onOpenChange(false)} title="Chỉnh sửa tài khoản" centered size="md">
      <Text size="sm" c="dimmed" mb="md">
        Cập nhật thông tin cho tài khoản{' '}
        <Text span fw={600} c="var(--mantine-color-text)">
          {user?.userName}
        </Text>
        .
      </Text>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap="sm">
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
                disabled={isCurrentUser}
                allowDeselect={false}
                description={isCurrentUser ? 'Không thể tự thay đổi vai trò của chính mình.' : undefined}
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
                    placeholder="Chọn xã/phường"
                    data={wardOptions}
                    value={field.value || null}
                    onChange={(val) => field.onChange(val ?? '')}
                    clearable
                    searchable
                    error={errors.wardId?.message}
                  />
                )}
              />
            </>
          )}

          <Group justify="flex-end" mt="xs">
            <Button type="button" variant="default" onClick={() => onOpenChange(false)} disabled={updateUser.isPending}>
              Hủy
            </Button>
            <Button type="submit" loading={updateUser.isPending}>
              {updateUser.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
