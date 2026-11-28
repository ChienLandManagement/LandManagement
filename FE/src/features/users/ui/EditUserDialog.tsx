import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, MultiSelect, Select, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getListUsersQueryKey, useListWards, useUpdateUser } from '@/shared/api/generated/api';
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
      wardIds: [],
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

  useEffect(() => {
    if (user && open) {
      reset({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        role: isUserRoleKey(user.role) ? user.role : 'LandOfficer',
        wardIds: (user.wards ?? []).map((w) => w.id ?? ''),
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
          wardIds: values.role === 'Admin' ? [] : values.wardIds,
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

  const wardOptions = wards
    .filter((ward): ward is typeof ward & { id: string } => Boolean(ward.id))
    .map((ward) => ({
      value: ward.id,
      label: ward.provinceName ? `${ward.name} (${ward.provinceName})` : (ward.name ?? ward.id),
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
                disabled={isCurrentUser}
                allowDeselect={false}
                description={isCurrentUser ? 'Không thể tự thay đổi vai trò của chính mình.' : undefined}
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
