import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Group, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  getListLandTypesQueryKey,
  useCreateLandType,
  useUpdateLandType,
} from '@/shared/api/generated/api';
import type { LandTypeItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { type LandTypeFormValues, landTypeSchema } from '../model/catalogSchemas';
import { type TreeNode, getDescendantIds } from '../model/treeUtils';

interface LandTypeFormDialogProps {
  opened: boolean;
  onClose: () => void;
  item?: LandTypeItem | null;
  allItems: TreeNode<LandTypeItem>[];
}

export function LandTypeFormDialog({ opened, onClose, item, allItems }: LandTypeFormDialogProps) {
  const queryClient = useQueryClient();
  const createLandType = useCreateLandType();
  const updateLandType = useUpdateLandType();
  const isEdit = Boolean(item?.id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LandTypeFormValues>({
    resolver: zodResolver(landTypeSchema),
    defaultValues: {
      code: '',
      name: '',
      parentId: null,
      sortOrder: 0,
      inB02: false,
      inB05: false,
    },
  });

  useEffect(() => {
    if (opened) {
      reset({
        code: item?.code ?? '',
        name: item?.name ?? '',
        parentId: item?.parentId ?? null,
        sortOrder: item?.sortOrder ?? 0,
        inB02: item?.inB02 ?? false,
        inB05: item?.inB05 ?? false,
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

  const onSubmit = async (values: LandTypeFormValues) => {
    try {
      if (isEdit && item?.id) {
        await updateLandType.mutateAsync({
          id: item.id,
          data: {
            code: values.code,
            name: values.name,
            parentId: values.parentId || null,
            sortOrder: values.sortOrder ?? 0,
            inB02: values.inB02,
            inB05: values.inB05,
          },
        });
        showSuccess('Cập nhật loại đất thành công');
      } else {
        await createLandType.mutateAsync({
          data: {
            code: values.code,
            name: values.name,
            parentId: values.parentId || null,
            inB02: values.inB02,
            inB05: values.inB05,
          },
        });
        showSuccess('Thêm loại đất thành công');
      }
      await queryClient.invalidateQueries({ queryKey: getListLandTypesQueryKey() });
      onClose();
    } catch (error) {
      showError(error);
    }
  };

  const isPending = createLandType.isPending || updateLandType.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Cập nhật loại đất' : 'Thêm loại đất'}
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
                label="Mã loại đất"
                placeholder="VD: LUA"
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
                label="Tên loại đất"
                placeholder="VD: Đất trồng lúa"
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
                onChange={(val) => field.onChange(val)}
                clearable
                searchable
                nothingFoundMessage="Không tìm thấy"
                error={errors.parentId?.message}
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
          <Group gap="lg" mt="xs">
            <Controller
              name="inB02"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Có ở biểu 02"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.currentTarget.checked)}
                />
              )}
            />
            <Controller
              name="inB05"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Có ở biểu 05"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.currentTarget.checked)}
                />
              )}
            />
          </Group>

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
