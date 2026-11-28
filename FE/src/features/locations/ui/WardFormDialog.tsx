import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  getListWardsQueryKey,
  useCreateWard,
  useListProvinces,
  useUpdateWard,
} from '@/shared/api/generated/api';
import type { WardItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { type WardFormValues, wardSchema } from '../model/locationSchemas';

interface WardFormDialogProps {
  opened: boolean;
  onClose: () => void;
  ward?: WardItem | null;
}

export function WardFormDialog({ opened, onClose, ward }: WardFormDialogProps) {
  const queryClient = useQueryClient();
  const createWard = useCreateWard();
  const updateWard = useUpdateWard();
  const isEdit = Boolean(ward?.id);

  const { data: provincesData } = useListProvinces(
    { PageSize: 200 },
    { query: { enabled: opened } },
  );
  const provinceOptions = (provincesData?.data?.items ?? []).map((p) => ({
    value: p.id ?? '',
    label: `${p.provinceCode ?? ''} - ${p.name ?? ''}`,
  }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WardFormValues>({
    resolver: zodResolver(wardSchema),
    defaultValues: {
      wardCode: '',
      name: '',
      provinceId: '',
    },
  });

  useEffect(() => {
    if (opened) {
      reset({
        wardCode: ward?.wardCode ?? '',
        name: ward?.name ?? '',
        provinceId: ward?.provinceId ?? '',
      });
    }
  }, [opened, ward, reset]);

  const onSubmit = async (values: WardFormValues) => {
    try {
      if (isEdit && ward?.id) {
        await updateWard.mutateAsync({ id: ward.id, data: values });
        showSuccess('Cập nhật xã/phường thành công');
      } else {
        await createWard.mutateAsync({ data: values });
        showSuccess('Thêm xã/phường thành công');
      }
      await queryClient.invalidateQueries({ queryKey: getListWardsQueryKey() });
      onClose();
    } catch (error) {
      showError(error);
    }
  };

  const isPending = createWard.isPending || updateWard.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Cập nhật xã/phường' : 'Thêm xã/phường'}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <Controller
            name="provinceId"
            control={control}
            render={({ field }) => (
              <Select
                label="Tỉnh/Thành phố"
                placeholder="Chọn tỉnh/thành phố"
                data={provinceOptions}
                searchable
                required
                value={field.value || null}
                onChange={(val) => field.onChange(val ?? '')}
                error={errors.provinceId?.message}
              />
            )}
          />
          <Controller
            name="wardCode"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Mã xã/phường"
                placeholder="VD: 00001"
                maxLength={6}
                required
                error={errors.wardCode?.message}
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Tên xã/phường"
                placeholder="VD: Phường Phúc Xá"
                required
                error={errors.name?.message}
              />
            )}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} disabled={isPending}>
              Hủy
            </Button>
            <Button type="submit" loading={isPending}>
              {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
