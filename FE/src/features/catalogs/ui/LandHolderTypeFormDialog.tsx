import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  getListLandHolderTypesQueryKey,
  useCreateLandHolderType,
  useUpdateLandHolderType,
} from '@/shared/api/generated/api';
import type { LandHolderTypeItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import {
  LAND_HOLDER_KIND_OPTIONS,
  type LandHolderTypeFormValues,
  landHolderTypeSchema,
  toLandHolderKind,
} from '../model/catalogSchemas';
import { getDescendantIds, type TreeNode } from '../model/treeUtils';

interface LandHolderTypeFormDialogProps {
  opened: boolean;
  onClose: () => void;
  item?: LandHolderTypeItem | null;
  allItems: TreeNode<LandHolderTypeItem>[];
}

export function LandHolderTypeFormDialog({ opened, onClose, item, allItems }: LandHolderTypeFormDialogProps) {
  const queryClient = useQueryClient();
  const createLandHolderType = useCreateLandHolderType();
  const updateLandHolderType = useUpdateLandHolderType();
  const isEdit = Boolean(item?.id);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LandHolderTypeFormValues>({
    resolver: zodResolver(landHolderTypeSchema),
    defaultValues: {
      code: '',
      name: '',
      parentId: null,
      sortOrder: 0,
      kind: 'User',
    },
  });

  const selectedParentId = useWatch({ control, name: 'parentId' });

  useEffect(() => {
    if (opened) {
      const initialKind = item?.kind === 'Manager' ? 'Manager' : 'User';
      reset({
        code: item?.code ?? '',
        name: item?.name ?? '',
        parentId: item?.parentId ?? null,
        sortOrder: item?.sortOrder ?? 0,
        kind: initialKind,
      });
    }
  }, [opened, item, reset]);

  const parentOptions = useMemo(() => {
    const excluded = item?.id ? getDescendantIds(allItems, item.id) : new Set<string>();
    return allItems
      .filter((node) => node.id && !excluded.has(node.id))
      .map((node) => ({
        value: node.id!,
        label: `${'— '.repeat(node.depth)}${node.code ?? ''} - ${node.name ?? ''}`,
      }));
  }, [allItems, item?.id]);

  const handleParentChange = (val: string | null) => {
    setValue('parentId', val);
    if (val) {
      const parent = allItems.find((node) => node.id === val);
      if (parent?.kind === 'User' || parent?.kind === 'Manager') {
        setValue('kind', parent.kind, { shouldValidate: true });
      }
    }
  };

  const onSubmit = async (values: LandHolderTypeFormValues) => {
    try {
      if (isEdit && item?.id) {
        await updateLandHolderType.mutateAsync({
          id: item.id,
          data: {
            code: values.code,
            name: values.name,
            parentId: values.parentId || null,
            sortOrder: values.sortOrder ?? 0,
            kind: toLandHolderKind(values.kind),
          },
        });
        showSuccess('Cập nhật đối tượng sử dụng/quản lý đất thành công');
      } else {
        await createLandHolderType.mutateAsync({
          data: {
            code: values.code,
            name: values.name,
            parentId: values.parentId || null,
            kind: toLandHolderKind(values.kind),
          },
        });
        showSuccess('Thêm đối tượng sử dụng/quản lý đất thành công');
      }
      await queryClient.invalidateQueries({ queryKey: getListLandHolderTypesQueryKey() });
      onClose();
    } catch (error) {
      showError(error);
    }
  };

  const isPending = createLandHolderType.isPending || updateLandHolderType.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Cập nhật đối tượng sử dụng/quản lý đất' : 'Thêm đối tượng sử dụng/quản lý đất'}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Mã đối tượng"
                placeholder="VD: GDC"
                maxLength={10}
                required
                error={errors.code?.message}
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Tên đối tượng"
                placeholder="VD: Hộ gia đình, cá nhân"
                maxLength={255}
                required
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Select
                label="Mục cha"
                placeholder="Không có (mục gốc)"
                data={parentOptions}
                value={field.value ?? null}
                onChange={handleParentChange}
                clearable
                searchable
                nothingFoundMessage="Không tìm thấy"
                error={errors.parentId?.message}
              />
            )}
          />
          <Controller
            name="kind"
            control={control}
            render={({ field }) => (
              <Select
                label="Nhóm"
                data={LAND_HOLDER_KIND_OPTIONS}
                value={field.value}
                onChange={(val) => {
                  if (val === 'User' || val === 'Manager') {
                    field.onChange(val);
                  }
                }}
                disabled={Boolean(selectedParentId)}
                required
                error={errors.kind?.message}
              />
            )}
          />
          {isEdit && (
            <Controller
              name="sortOrder"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Thứ tự"
                  min={0}
                  value={field.value ?? 0}
                  onChange={(val) => field.onChange(typeof val === 'number' ? val : 0)}
                  error={errors.sortOrder?.message}
                />
              )}
            />
          )}

          <Group justify="flex-end" mt="md">
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
