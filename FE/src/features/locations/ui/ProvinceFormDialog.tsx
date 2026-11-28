import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  getListProvincesQueryKey,
  getListWardsQueryKey,
  useCreateProvince,
  useUpdateProvince,
} from '@/shared/api/generated/api';
import type { ProvinceItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { PLACE_TYPE_OPTIONS, type ProvinceFormValues, provinceSchema } from '../model/locationSchemas';

interface ProvinceFormDialogProps {
  opened: boolean;
  onClose: () => void;
  province?: ProvinceItem | null;
}

export function ProvinceFormDialog({ opened, onClose, province }: ProvinceFormDialogProps) {
  const queryClient = useQueryClient();
  const createProvince = useCreateProvince();
  const updateProvince = useUpdateProvince();
  const isEdit = Boolean(province?.id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProvinceFormValues>({
    resolver: zodResolver(provinceSchema),
    defaultValues: {
      provinceCode: '',
      name: '',
      shortName: '',
      placeType: '',
      country: 'VN',
    },
  });

  useEffect(() => {
    if (opened) {
      reset({
        provinceCode: province?.provinceCode ?? '',
        name: province?.name ?? '',
        shortName: province?.shortName ?? '',
        placeType: province?.placeType ?? '',
        country: province?.country ?? 'VN',
      });
    }
  }, [opened, province, reset]);

  const onSubmit = async (values: ProvinceFormValues) => {
    const payload = {
      provinceCode: values.provinceCode,
      name: values.name,
      shortName: values.shortName || undefined,
      placeType: values.placeType || undefined,
      country: values.country || null,
    };

    try {
      if (isEdit && province?.id) {
        await updateProvince.mutateAsync({ id: province.id, data: payload });
        showSuccess('Cập nhật tỉnh/thành phố thành công');
        await queryClient.invalidateQueries({ queryKey: getListWardsQueryKey() });
      } else {
        await createProvince.mutateAsync({ data: payload });
        showSuccess('Thêm tỉnh/thành phố thành công');
      }
      await queryClient.invalidateQueries({ queryKey: getListProvincesQueryKey() });
      onClose();
    } catch (error) {
      showError(error);
    }
  };

  const isPending = createProvince.isPending || updateProvince.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Cập nhật tỉnh/thành phố' : 'Thêm tỉnh/thành phố'}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <Controller
            name="provinceCode"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Mã tỉnh/thành phố"
                placeholder="VD: 01"
                maxLength={2}
                required
                error={errors.provinceCode?.message}
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Tên tỉnh/thành phố"
                placeholder="VD: Thành phố Hà Nội"
                required
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            name="shortName"
            control={control}
            render={({ field }) => (
              <TextInput {...field} label="Tên viết tắt" placeholder="VD: Hà Nội" error={errors.shortName?.message} />
            )}
          />
          <Controller
            name="placeType"
            control={control}
            render={({ field }) => (
              <Select
                label="Loại"
                placeholder="Chọn loại"
                data={PLACE_TYPE_OPTIONS}
                clearable
                value={field.value || null}
                onChange={(val) => field.onChange(val ?? '')}
                error={errors.placeType?.message}
              />
            )}
          />
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <TextInput {...field} label="Quốc gia" placeholder="VN" error={errors.country?.message} />
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
