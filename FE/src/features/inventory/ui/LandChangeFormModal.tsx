import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  getCheckPeriodQueryKey,
  getGetEntriesQueryKey,
  getListLandChangesQueryKey,
  getListPeriodsQueryKey,
  useCreateLandChange,
  useListLandHolderTypes,
  useListLandTypes,
  useUpdateLandChange,
} from '@/shared/api/generated/api';
import type { LandChangeItem, LandChangeReason } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { toDateOnlyString } from '../model/constants';
import { LAND_CHANGE_REASON_OPTIONS } from '../model/landChangeReasons';

interface LandChangeFormModalProps {
  opened: boolean;
  onClose: () => void;
  periodId: string;
  cutoffDate?: string;
  editingItem?: LandChangeItem | null;
}

const landChangeSchema = z
  .object({
    changeDate: z.string().min(1, 'Vui lòng chọn ngày biến động'),
    fromLandTypeId: z.string().nullable().optional(),
    toLandTypeId: z.string().nullable().optional(),
    area: z.number({ message: 'Vui lòng nhập diện tích' }).positive('Diện tích phải lớn hơn 0'),
    holderTypeId: z.string().nullable().optional(),
    note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').nullable().optional(),
    reason: z.string().nullable().optional(),
    reasonText: z.string().max(200, 'Lý do tối đa 200 ký tự').nullable().optional(),
  })
  .refine((data) => Boolean(data.fromLandTypeId || data.toLandTypeId), {
    message: 'Phải chọn ít nhất một trong hai loại đất (cũ hoặc mới)',
    path: ['fromLandTypeId'],
  })
  .refine((data) => Boolean(data.fromLandTypeId && data.toLandTypeId) || Boolean(data.reason), {
    message: 'Tăng/giảm khác phải chọn lý do',
    path: ['reason'],
  })
  .refine((data) => data.reason !== 'Other' || Boolean(data.reasonText?.trim()), {
    message: 'Nhập lý do khác',
    path: ['reasonText'],
  })
  .refine((data) => !(data.fromLandTypeId && data.toLandTypeId && data.fromLandTypeId === data.toLandTypeId), {
    message: 'Loại đất cũ và loại đất mới không được trùng nhau',
    path: ['toLandTypeId'],
  });

type LandChangeFormValues = z.infer<typeof landChangeSchema>;

export function LandChangeFormModal({ opened, onClose, periodId, cutoffDate, editingItem }: LandChangeFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(editingItem?.id);

  const createLandChange = useCreateLandChange();
  const updateLandChange = useUpdateLandChange();

  const { data: landTypesData } = useListLandTypes({ query: { enabled: opened } });
  const { data: holderTypesData } = useListLandHolderTypes(undefined, { query: { enabled: opened } });

  const validLandTypes = useMemo(
    () =>
      (landTypesData?.data ?? [])
        .filter((lt) => lt.inB05 === true && lt.isMemo === false && lt.id)
        .map((lt) => ({
          value: lt.id ?? '',
          label: `${lt.code ?? ''} - ${lt.name ?? ''}`,
        })),
    [landTypesData?.data],
  );

  const holderTypeOptions = useMemo(
    () =>
      (holderTypesData?.data ?? [])
        .filter((ht) => ht.id && ht.name)
        .map((ht) => ({ value: ht.id ?? '', label: ht.name ?? '' })),
    [holderTypesData?.data],
  );

  const defaultDate = cutoffDate || toDateOnlyString(new Date());

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LandChangeFormValues>({
    resolver: zodResolver(landChangeSchema),
    defaultValues: {
      changeDate: defaultDate,
      fromLandTypeId: null,
      toLandTypeId: null,
      area: undefined,
      holderTypeId: null,
      note: '',
      reason: null,
      reasonText: '',
    },
  });

  const selectedFromId = watch('fromLandTypeId');
  const selectedToId = watch('toLandTypeId');
  const selectedReason = watch('reason');
  // Chỉ tăng khác / giảm khác (thiếu một trong hai loại đất) mới cần lý do.
  const needsReason = !selectedFromId || !selectedToId;

  const fromOptions = useMemo(
    () => validLandTypes.filter((o) => o.value !== selectedToId),
    [validLandTypes, selectedToId],
  );

  const toOptions = useMemo(
    () => validLandTypes.filter((o) => o.value !== selectedFromId),
    [validLandTypes, selectedFromId],
  );

  useEffect(() => {
    if (!opened) return;
    if (editingItem) {
      reset({
        changeDate: editingItem.changeDate ?? defaultDate,
        fromLandTypeId: editingItem.fromLandTypeId ?? null,
        toLandTypeId: editingItem.toLandTypeId ?? null,
        area: editingItem.area ?? undefined,
        holderTypeId: editingItem.holderTypeId ?? null,
        note: editingItem.note ?? '',
        reason: editingItem.reason ?? null,
        reasonText: editingItem.reasonText ?? '',
      });
    } else {
      reset({
        changeDate: defaultDate,
        fromLandTypeId: null,
        toLandTypeId: null,
        area: undefined,
        holderTypeId: null,
        note: '',
        reason: null,
        reasonText: '',
      });
    }
  }, [opened, editingItem, defaultDate, reset]);

  const onSubmit = async (values: LandChangeFormValues) => {
    try {
      const payload = {
        changeDate: values.changeDate,
        fromLandTypeId: values.fromLandTypeId || null,
        toLandTypeId: values.toLandTypeId || null,
        area: values.area,
        holderTypeId: values.holderTypeId || null,
        note: values.note?.trim() || null,
        reason: needsReason ? ((values.reason as LandChangeReason | null) ?? null) : null,
        reasonText: needsReason && values.reason === 'Other' ? values.reasonText?.trim() || null : null,
      };

      if (isEditing && editingItem?.id) {
        await updateLandChange.mutateAsync({
          id: editingItem.id,
          data: payload,
        });
        showSuccess('Cập nhật biến động thành công');
      } else {
        await createLandChange.mutateAsync({
          data: {
            periodId,
            ...payload,
          },
        });
        showSuccess('Ghi biến động thành công');
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getListLandChangesQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getListPeriodsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetEntriesQueryKey(periodId) }),
        queryClient.invalidateQueries({ queryKey: getCheckPeriodQueryKey(periodId) }),
      ]);
      onClose();
    } catch (error) {
      showError(error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Cập nhật biến động đất đai' : 'Ghi biến động đất đai'}
      centered
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <Controller
            name="changeDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Ngày biến động"
                placeholder="dd/mm/yyyy"
                valueFormat="DD/MM/YYYY"
                maxDate={cutoffDate}
                required
                value={field.value || null}
                onChange={(value) => field.onChange(value ?? '')}
                error={errors.changeDate?.message}
              />
            )}
          />

          <Controller
            name="fromLandTypeId"
            control={control}
            render={({ field }) => (
              <Select
                label="Loại đất cũ (để trống = tăng khác)"
                placeholder="Chọn loại đất cũ"
                data={fromOptions}
                searchable
                clearable
                value={field.value ?? null}
                onChange={field.onChange}
                error={errors.fromLandTypeId?.message}
              />
            )}
          />

          <Controller
            name="toLandTypeId"
            control={control}
            render={({ field }) => (
              <Select
                label="Loại đất mới (để trống = giảm khác)"
                placeholder="Chọn loại đất mới"
                data={toOptions}
                searchable
                clearable
                value={field.value ?? null}
                onChange={field.onChange}
                error={errors.toLandTypeId?.message}
              />
            )}
          />

          {needsReason && (
            <>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Lý do tăng/giảm khác"
                    placeholder="Chọn lý do"
                    data={LAND_CHANGE_REASON_OPTIONS}
                    required
                    value={field.value ?? null}
                    onChange={field.onChange}
                    error={errors.reason?.message}
                  />
                )}
              />
              {selectedReason === 'Other' && (
                <Controller
                  name="reasonText"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="Nêu rõ lý do"
                      placeholder="Ví dụ: nhận bàn giao từ xã khác"
                      required
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      error={errors.reasonText?.message}
                    />
                  )}
                />
              )}
            </>
          )}

          <Controller
            name="area"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Diện tích (ha)"
                placeholder="Nhập diện tích"
                min={0.00001}
                decimalScale={5}
                thousandSeparator="."
                decimalSeparator=","
                required
                value={field.value ?? ''}
                onChange={(val) => field.onChange(typeof val === 'number' ? val : undefined)}
                error={errors.area?.message}
              />
            )}
          />

          <Controller
            name="holderTypeId"
            control={control}
            render={({ field }) => (
              <Select
                label="Đối tượng sử dụng đất"
                placeholder="Chọn đối tượng (không bắt buộc)"
                data={holderTypeOptions}
                searchable
                clearable
                value={field.value ?? null}
                onChange={field.onChange}
                error={errors.holderTypeId?.message}
              />
            )}
          />

          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Ghi chú"
                placeholder="Nhập ghi chú (tối đa 500 ký tự)"
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
              {isEditing ? 'Lưu thay đổi' : 'Ghi biến động'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
