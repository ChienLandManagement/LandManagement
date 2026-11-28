import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { getUser } from '@/entities/session';
import {
  getListParcelsQueryKey,
  useCreateParcel,
  useListLandHolderTypes,
  useListLandTypes,
  useListWards,
  useUpdateParcel,
} from '@/shared/api/generated/api';
import type { ParcelItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { getLeafLandHolderTypeOptions, getLeafLandTypeOptions } from '../model/leafOptions';

interface ParcelFormModalProps {
  opened: boolean;
  onClose: () => void;
  editingItem?: ParcelItem | null;
}

const createSchema = (isAdmin: boolean, isEditing: boolean) =>
  z.object({
    wardId: isAdmin && !isEditing ? z.string().min(1, 'Vui lòng chọn xã/phường') : z.string().optional().nullable(),
    mapSheet: z.string().trim().min(1, 'Vui lòng nhập số tờ'),
    parcelNumber: z.string().trim().min(1, 'Vui lòng nhập số thửa'),
    area: z.number({ message: 'Vui lòng nhập diện tích' }).positive('Diện tích phải lớn hơn 0'),
    landTypeId: z.string().min(1, 'Vui lòng chọn loại đất'),
    holderTypeId: z.string().optional().nullable(),
    holderName: z.string().max(200, 'Tên người sử dụng tối đa 200 ký tự').optional().nullable(),
    address: z.string().max(300, 'Địa chỉ tối đa 300 ký tự').optional().nullable(),
    note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional().nullable(),
  });

type ParcelFormValues = z.infer<ReturnType<typeof createSchema>>;

export function ParcelFormModal({ opened, onClose, editingItem }: ParcelFormModalProps) {
  const queryClient = useQueryClient();
  const isAdmin = getUser()?.role === 'Admin';
  const isEditing = Boolean(editingItem?.id);

  const createParcel = useCreateParcel();
  const updateParcel = useUpdateParcel();

  const { data: wardsData } = useListWards({ PageSize: 200 }, { query: { enabled: opened && isAdmin && !isEditing } });
  const { data: landTypesData } = useListLandTypes();
  const { data: holderTypesData } = useListLandHolderTypes();

  const wardOptions = useMemo(
    () =>
      (wardsData?.data?.items ?? [])
        .filter((w) => w.id && w.name)
        .map((w) => ({ value: w.id ?? '', label: w.name ?? '' })),
    [wardsData?.data?.items],
  );

  const landTypeOptions = useMemo(() => getLeafLandTypeOptions(landTypesData?.data ?? []), [landTypesData?.data]);

  const holderTypeOptions = useMemo(
    () => getLeafLandHolderTypeOptions(holderTypesData?.data ?? []),
    [holderTypesData?.data],
  );

  const schema = useMemo(() => createSchema(isAdmin, isEditing), [isAdmin, isEditing]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ParcelFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      wardId: null,
      mapSheet: '',
      parcelNumber: '',
      area: undefined,
      landTypeId: '',
      holderTypeId: null,
      holderName: '',
      address: '',
      note: '',
    },
  });

  useEffect(() => {
    if (!opened) return;
    if (editingItem) {
      reset({
        wardId: editingItem.wardId ?? null,
        mapSheet: editingItem.mapSheet ?? '',
        parcelNumber: editingItem.parcelNumber ?? '',
        area: editingItem.area ?? undefined,
        landTypeId: editingItem.landTypeId ?? '',
        holderTypeId: editingItem.holderTypeId ?? null,
        holderName: editingItem.holderName ?? '',
        address: editingItem.address ?? '',
        note: editingItem.note ?? '',
      });
    } else {
      reset({
        wardId: null,
        mapSheet: '',
        parcelNumber: '',
        area: undefined,
        landTypeId: '',
        holderTypeId: null,
        holderName: '',
        address: '',
        note: '',
      });
    }
  }, [opened, editingItem, reset]);

  const onSubmit = async (values: ParcelFormValues) => {
    try {
      const commonFields = {
        mapSheet: values.mapSheet.trim(),
        parcelNumber: values.parcelNumber.trim(),
        area: values.area,
        landTypeId: values.landTypeId,
        holderTypeId: values.holderTypeId || null,
        holderName: values.holderName?.trim() || null,
        address: values.address?.trim() || null,
        note: values.note?.trim() || null,
      };

      if (isEditing && editingItem?.id) {
        await updateParcel.mutateAsync({
          id: editingItem.id,
          data: commonFields,
        });
        showSuccess('Cập nhật thửa đất thành công');
      } else {
        await createParcel.mutateAsync({
          data: {
            ...commonFields,
            wardId: isAdmin ? values.wardId || null : null,
          },
        });
        showSuccess('Thêm thửa đất thành công');
      }

      await queryClient.invalidateQueries({ queryKey: getListParcelsQueryKey() });
      onClose();
    } catch (error) {
      showError(error);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? 'Cập nhật thửa đất' : 'Thêm thửa đất'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          {isAdmin && !isEditing && (
            <Controller
              name="wardId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Xã/Phường"
                  placeholder="Chọn xã/phường"
                  data={wardOptions}
                  searchable
                  required
                  value={field.value ?? null}
                  onChange={field.onChange}
                  error={errors.wardId?.message}
                />
              )}
            />
          )}

          <Group grow>
            <Controller
              name="mapSheet"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Số tờ"
                  placeholder="Nhập số tờ"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.mapSheet?.message}
                />
              )}
            />

            <Controller
              name="parcelNumber"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Số thửa"
                  placeholder="Nhập số thửa"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.parcelNumber?.message}
                />
              )}
            />

            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Diện tích (ha)"
                  placeholder="0.00000"
                  required
                  hideControls
                  decimalScale={5}
                  min={0}
                  value={field.value ?? ''}
                  onChange={(val) => field.onChange(typeof val === 'number' ? val : undefined)}
                  error={errors.area?.message}
                />
              )}
            />
          </Group>

          <Group grow>
            <Controller
              name="landTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Loại đất"
                  placeholder="Chọn loại đất"
                  data={landTypeOptions}
                  searchable
                  required
                  value={field.value || null}
                  onChange={(val) => field.onChange(val ?? '')}
                  error={errors.landTypeId?.message}
                />
              )}
            />

            <Controller
              name="holderTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Đối tượng sử dụng"
                  placeholder="Chọn đối tượng (tùy chọn)"
                  data={holderTypeOptions}
                  searchable
                  clearable
                  value={field.value ?? null}
                  onChange={field.onChange}
                  error={errors.holderTypeId?.message}
                />
              )}
            />
          </Group>

          <Controller
            name="holderName"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Tên người sử dụng"
                placeholder="Nhập tên người sử dụng"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.holderName?.message}
              />
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Địa chỉ"
                placeholder="Nhập địa chỉ thửa đất"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.address?.message}
              />
            )}
          />

          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Ghi chú"
                placeholder="Nhập ghi chú (nếu có)"
                rows={3}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.note?.message}
              />
            )}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" loading={isSubmitting || createParcel.isPending || updateParcel.isPending}>
              {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
