import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { getWardScope } from '@/entities/session';
import { toDateOnlyString } from '@/features/inventory';
import {
  getGetDashboardOverviewQueryKey,
  getListDossiersQueryKey,
  useCreateDossier,
  useListParcels,
  useListWards,
  useUpdateDossier,
} from '@/shared/api/generated/api';
import type { DossierItem, DossierStatus } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { DOSSIER_STATUS_OPTIONS, isResolvedStatus } from '../model/dossierStatus';

interface DossierFormModalProps {
  opened: boolean;
  onClose: () => void;
  editingItem?: DossierItem | null;
}

const createSchema = (canPickWard: boolean, isEditing: boolean) =>
  z
    .object({
      wardId:
        canPickWard && !isEditing ? z.string().min(1, 'Vui lòng chọn xã/phường') : z.string().optional().nullable(),
      code: z.string().trim().min(1, 'Vui lòng nhập mã hồ sơ').max(50, 'Mã hồ sơ tối đa 50 ký tự'),
      applicantName: z.string().trim().min(1, 'Vui lòng nhập tên người nộp').max(255, 'Tối đa 255 ký tự'),
      parcelId: z.string().optional().nullable(),
      status: z.string().min(1, 'Vui lòng chọn trạng thái'),
      receivedDate: z.string().min(1, 'Vui lòng chọn ngày tiếp nhận'),
      dueDate: z.string().optional().nullable(),
      resolvedDate: z.string().optional().nullable(),
      note: z.string().max(1000, 'Ghi chú tối đa 1000 ký tự').optional().nullable(),
    })
    .refine((v) => !v.dueDate || v.dueDate >= v.receivedDate, {
      message: 'Hạn xử lý không được trước ngày tiếp nhận',
      path: ['dueDate'],
    });

type DossierFormValues = z.infer<ReturnType<typeof createSchema>>;

const emptyValues = (): DossierFormValues => ({
  wardId: null,
  code: '',
  applicantName: '',
  parcelId: null,
  status: 'Processing',
  receivedDate: toDateOnlyString(new Date()),
  dueDate: null,
  resolvedDate: null,
  note: '',
});

export function DossierFormModal({ opened, onClose, editingItem }: DossierFormModalProps) {
  const queryClient = useQueryClient();
  const { isAdmin, wardIds, canPickWard } = getWardScope();
  const isEditing = Boolean(editingItem?.id);

  const createDossier = useCreateDossier();
  const updateDossier = useUpdateDossier();

  const schema = useMemo(() => createSchema(canPickWard, isEditing), [canPickWard, isEditing]);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DossierFormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues() });

  const status = watch('status');
  const selectedWardId = isEditing ? editingItem?.wardId : watch('wardId');
  const [parcelSearch, setParcelSearch] = useState('');
  const [debouncedParcelSearch] = useDebouncedValue(parcelSearch, 300);

  const { data: wardsData } = useListWards(
    { PageSize: 200 },
    { query: { enabled: opened && canPickWard && !isEditing } },
  );
  // Thửa gắn kèm phải cùng xã với hồ sơ: người nhiều xã chọn xã trước.
  const { data: parcelsData } = useListParcels(
    { PageSize: 30, Query: debouncedParcelSearch.trim() || null, WardId: selectedWardId || null },
    { query: { enabled: opened && (!canPickWard || Boolean(selectedWardId)) } },
  );

  const wardOptions = useMemo(
    () =>
      (wardsData?.data?.items ?? [])
        .filter((w) => w.id && w.name && (isAdmin || wardIds.includes(w.id)))
        .map((w) => ({ value: w.id ?? '', label: w.name ?? '' })),
    [wardsData?.data?.items, isAdmin, wardIds],
  );

  const parcelOptions = useMemo(() => {
    const options = (parcelsData?.data?.items ?? [])
      .filter((p) => p.id)
      .map((p) => ({ value: p.id ?? '', label: `Tờ ${p.mapSheet}, thửa ${p.parcelNumber}` }));
    // Thửa đang gắn phải có trong danh sách để Select hiện đúng nhãn.
    if (editingItem?.parcelId && !options.some((o) => o.value === editingItem.parcelId))
      options.unshift({ value: editingItem.parcelId, label: editingItem.parcelLabel ?? editingItem.parcelId });
    return options;
  }, [parcelsData?.data?.items, editingItem]);

  useEffect(() => {
    if (!opened) return;
    setParcelSearch('');
    reset(
      editingItem
        ? {
            wardId: editingItem.wardId ?? null,
            code: editingItem.code ?? '',
            applicantName: editingItem.applicantName ?? '',
            parcelId: editingItem.parcelId ?? null,
            status: editingItem.status ?? 'Processing',
            receivedDate: editingItem.receivedDate ?? toDateOnlyString(new Date()),
            dueDate: editingItem.dueDate ?? null,
            resolvedDate: editingItem.resolvedDate ?? null,
            note: editingItem.note ?? '',
          }
        : emptyValues(),
    );
  }, [opened, editingItem, reset]);

  const onSubmit = async (values: DossierFormValues) => {
    try {
      const fields = {
        code: values.code.trim(),
        applicantName: values.applicantName.trim(),
        parcelId: values.parcelId || null,
        status: values.status as DossierStatus,
        receivedDate: values.receivedDate,
        dueDate: values.dueDate || null,
        resolvedDate: isResolvedStatus(values.status) ? values.resolvedDate || null : null,
        note: values.note?.trim() || null,
      };
      if (isEditing && editingItem?.id) {
        await updateDossier.mutateAsync({ id: editingItem.id, data: fields });
        showSuccess('Cập nhật hồ sơ thành công');
      } else {
        await createDossier.mutateAsync({ data: { ...fields, wardId: canPickWard ? values.wardId || null : null } });
        showSuccess('Thêm hồ sơ thành công');
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getListDossiersQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetDashboardOverviewQueryKey() }),
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
      title={isEditing ? 'Cập nhật hồ sơ cấp GCN' : 'Thêm hồ sơ cấp GCN'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          {canPickWard && !isEditing && (
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

          <Group grow align="flex-start">
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Mã hồ sơ"
                  placeholder="Nhập mã hồ sơ"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.code?.message}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Trạng thái"
                  data={DOSSIER_STATUS_OPTIONS}
                  allowDeselect={false}
                  required
                  value={field.value}
                  onChange={(val) => field.onChange(val ?? 'Processing')}
                  error={errors.status?.message}
                />
              )}
            />
          </Group>

          <Controller
            name="applicantName"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Người nộp hồ sơ"
                placeholder="Nhập họ tên người nộp"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.applicantName?.message}
              />
            )}
          />

          <Controller
            name="parcelId"
            control={control}
            render={({ field }) => (
              <Select
                label="Thửa đất liên quan"
                placeholder="Tìm theo số tờ, số thửa (không bắt buộc)"
                data={parcelOptions}
                searchable
                clearable
                onSearchChange={setParcelSearch}
                nothingFoundMessage="Không thấy thửa"
                value={field.value ?? null}
                onChange={field.onChange}
                error={errors.parcelId?.message}
              />
            )}
          />

          <Group grow align="flex-start">
            <Controller
              name="receivedDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="Ngày tiếp nhận"
                  placeholder="dd/mm/yyyy"
                  valueFormat="DD/MM/YYYY"
                  required
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? '')}
                  error={errors.receivedDate?.message}
                />
              )}
            />
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="Hạn xử lý"
                  placeholder="dd/mm/yyyy"
                  valueFormat="DD/MM/YYYY"
                  clearable
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? null)}
                  error={errors.dueDate?.message}
                />
              )}
            />
            {isResolvedStatus(status) && (
              <Controller
                name="resolvedDate"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Ngày có kết quả"
                    placeholder="Để trống = hôm nay"
                    valueFormat="DD/MM/YYYY"
                    clearable
                    value={field.value || null}
                    onChange={(value) => field.onChange(value ?? null)}
                  />
                )}
              />
            )}
          </Group>

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
            <Button type="submit" loading={isSubmitting || createDossier.isPending || updateDossier.isPending}>
              {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
