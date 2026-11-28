import { Button, Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getListWardsQueryKey,
  useDeleteWard,
  useListProvinces,
  useListWards,
} from '@/shared/api/generated/api';
import type { WardItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { DataTable, type DataTableAction, type DataTableColumn } from '@/shared/ui/data-table';
import { WardFormDialog } from './WardFormDialog';

export function WardsTab() {
  const queryClient = useQueryClient();
  const deleteWard = useDeleteWard();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>('wardCode');
  const [isDescending, setIsDescending] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<WardItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: provincesData } = useListProvinces({ PageSize: 200 });
  const provinceOptions = (provincesData?.data?.items ?? []).map((p) => ({
    value: p.id ?? '',
    label: `${p.provinceCode ?? ''} - ${p.name ?? ''}`,
  }));

  const { data, isLoading, isError, refetch } = useListWards({
    Query: debouncedQuery || undefined,
    ProvinceId: provinceFilter || undefined,
    CurrentPage: page,
    PageSize: pageSize,
    SortBy: sortBy,
    IsDescending: isDescending,
  });

  const paged = data?.data;
  const items = paged?.items ?? [];
  const totalRecords = paged?.totalItems ?? 0;

  const handleOpenCreate = () => {
    setEditingWard(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (ward: WardItem) => {
    setEditingWard(ward);
    setDialogOpen(true);
  };

  const handleDelete = (ward: WardItem) => {
    modals.openConfirmModal({
      title: 'Xóa xã/phường',
      centered: true,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa{' '}
          <Text span fw={600}>
            {ward.name} ({ward.wardCode})
          </Text>
          ?
        </Text>
      ),
      labels: { confirm: 'Xóa', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        if (!ward.id) return;
        try {
          await deleteWard.mutateAsync({ id: ward.id });
          showSuccess('Xóa xã/phường thành công');
          await queryClient.invalidateQueries({ queryKey: getListWardsQueryKey() });
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  const columns: DataTableColumn<WardItem>[] = [
    {
      key: 'wardCode',
      title: 'Mã xã/phường',
      sortable: true,
      width: 140,
      render: (row) => row.wardCode ?? '—',
    },
    {
      key: 'name',
      title: 'Tên xã/phường',
      sortable: true,
      render: (row) => row.name ?? '—',
    },
    {
      key: 'provinceName',
      title: 'Tỉnh/Thành phố',
      render: (row) =>
        row.provinceName ? `${row.provinceCode ? `${row.provinceCode} - ` : ''}${row.provinceName}` : '—',
    },
  ];

  const actions: DataTableAction<WardItem>[] = [
    {
      label: 'Sửa',
      icon: <Pencil size={14} />,
      onClick: handleOpenEdit,
    },
    {
      label: 'Xóa',
      icon: <Trash2 size={14} />,
      color: 'red',
      onClick: handleDelete,
    },
  ];

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="sm" wrap="wrap" style={{ flex: 1 }}>
            <TextInput
              placeholder="Tìm theo mã hoặc tên xã/phường..."
              leftSection={<Search size={16} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 220, maxWidth: 340 }}
            />
            <Select
              placeholder="Lọc theo tỉnh/thành phố"
              data={provinceOptions}
              value={provinceFilter}
              onChange={(val) => {
                setProvinceFilter(val);
                setPage(1);
              }}
              clearable
              searchable
              style={{ minWidth: 220, maxWidth: 300 }}
            />
          </Group>
          <Button leftSection={<Plus size={16} />} onClick={handleOpenCreate}>
            Thêm xã/phường
          </Button>
        </Group>
      </Paper>

      <DataTable
        columns={columns}
        records={items}
        rowKey={(row) => row.id ?? row.wardCode ?? ''}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        sortBy={sortBy}
        isDescending={isDescending}
        onSortChange={(nextSortBy, nextDesc) => {
          setSortBy(nextSortBy);
          setIsDescending(nextDesc);
          setPage(1);
        }}
        page={page}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPageChange={setPage}
        onPageSizeChange={(nextSize) => {
          setPageSize(nextSize);
          setPage(1);
        }}
        emptyText="Chưa có xã/phường nào"
        actions={actions}
      />

      <WardFormDialog
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        ward={editingWard}
      />
    </Stack>
  );
}
