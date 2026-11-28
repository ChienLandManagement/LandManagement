import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, Select, Stack, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { getWardScope } from '@/entities/session';
import { getListPeriodsQueryKey, useCreatePeriod, useListWards, useUpdatePeriod } from '@/shared/api/generated/api';
import { type InventoryPeriodItem, InventoryPeriodType } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { PERIOD_TYPE_OPTIONS, toDateOnlyString } from '../model/constants';

interface PeriodFormModalProps {
  opened: boolean;
  onClose: () => void;
  editingItem?: InventoryPeriodItem | null;
}

const createSchema = (canPickWard: boolean, isEditing: boolean) =>
  z.object({
    wardId: canPickWard && !isEditing ? z.string().min(1, 'Vui lòng chọn xã/phường') : z.string().optional().nullable(),
    cutoffDate: z.string().min(1, 'Vui lòng chọn ngày chốt số liệu'),
    type: z.enum([InventoryPeriodType.Annual, InventoryPeriodType.FiveYear], {
      message: 'Vui lòng chọn loại kỳ kiểm kê',
    }),
    note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional().nullable(),
  });

type PeriodFormValues = z.infer<ReturnType<typeof createSchema>>;

export function PeriodFormModal({ opened, onClose, editingItem }: PeriodFormModalProps) {
  const queryClient = useQueryClient();
  const { isAdmin, wardIds, canPickWard } = getWardScope();
  const isEditing = Boolean(editingItem?.id);

  const createPeriod = useCreatePeriod();
  const updatePeriod = useUpdatePeriod();

  const { data: wardsData } = useListWards(
    { PageSize: 200 },
    { query: { enabled: opened && canPickWard && !isEditing } },
  );

  const wardOptions = useMemo(
    () =>
      (wardsData?.data?.items ?? [])
        .filter((w) => w.id && w.name && (isAdmin || wardIds.includes(w.id)))
        .map((w) => ({ value: w.id ?? '', label: w.name ?? '' })),
    [wardsData?.data?.items, isAdmin, wardIds],
  );

  const schema = useMemo(() => createSchema(canPickWard, isEditing), [canPickWard, isEditing]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PeriodFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      wardId: null,
      cutoffDate: toDateOnlyString(new Date()),
      type: InventoryPeriodType.Annual,
      note: '',
    },
  });

  useEffect(() => {
    if (!opened) return;
    if (editingItem) {
      reset({
        wardId: editingItem.wardId ?? null,
        cutoffDate: editingItem.cutoffDate ?? toDateOnlyString(new Date()),
        type:
          editingItem.type === InventoryPeriodType.FiveYear ? InventoryPeriodType.FiveYear : InventoryPeriodType.Annual,
        note: editingItem.note ?? '',
      });
    } else {
      reset({
        wardId: null,
        cutoffDate: toDateOnlyString(new Date()),
        type: InventoryPeriodType.Annual,
        note: '',
      });
    }
  }, [opened, editingItem, reset]);

  const onSubmit = async (values: PeriodFormValues) => {
    try {
      const cutoffDate = values.cutoffDate;
      const note = values.note?.trim() || null;

      if (isEditing && editingItem?.id) {
        await updatePeriod.mutateAsync({
          id: editingItem.id,
          data: { cutoffDate, type: values.type, note },
        });
        showSuccess('Cập nhật kỳ kiểm kê thành công');
      } else {
        await createPeriod.mutateAsync({
          data: {
            wardId: canPickWard ? values.wardId : undefined,
            cutoffDate,
            type: values.type,
            note,
          },
        });
        showSuccess('Tạo kỳ kiểm kê thành công');
      }

      await queryClient.invalidateQueries({ queryKey: getListPeriodsQueryKey() });
      onClose();
    } catch (error) {
      showError(error);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? 'Cập nhật kỳ kiểm kê' : 'Thêm kỳ kiểm kê'} centered>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          {canPickWard && !isEditing && (
            <Controller
              name="wardId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Xã/phường"
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

          <Controller
            name="cutoffDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Ngày chốt số liệu"
                placeholder="dd/mm/yyyy"
                valueFormat="DD/MM/YYYY"
                required
                value={field.value || null}
                onChange={(value) => field.onChange(value ?? '')}
                error={errors.cutoffDate?.message}
              />
            )}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Loại kỳ"
                data={PERIOD_TYPE_OPTIONS}
                required
                allowDeselect={false}
                value={field.value}
                onChange={(val) => {
                  if (val) field.onChange(val);
                }}
                error={errors.type?.message}
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
                autosize
                minRows={2}
                maxRows={4}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.note?.message}
              />
            )}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Lưu thay đổi' : 'Tạo kỳ'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
