import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  getListProvincesQueryKey,
  useDeleteProvince,
  useListProvinces,
} from '@/shared/api/generated/api';
import type { ProvinceItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { DataTable, type DataTableAction, type DataTableColumn } from '@/shared/ui/data-table';
import { AdminSearch, ListPageLayout } from '@/shared/ui/templates';
import { ProvinceFormDialog } from './ProvinceFormDialog';

export function ProvincesTab() {
  const queryClient = useQueryClient();
  const deleteProvince = useDeleteProvince();

  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>('provinceCode');
  const [isDescending, setIsDescending] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvince, setEditingProvince] = useState<ProvinceItem | null>(null);

  const { data, isLoading, isError, refetch } = useListProvinces({
    Query: keyword || undefined,
    CurrentPage: page,
    PageSize: pageSize,
    SortBy: sortBy,
    IsDescending: isDescending,
  });

  const paged = data?.data;
  const items = paged?.items ?? [];
  const totalRecords = paged?.totalItems ?? 0;

  const handleOpenCreate = () => {
    setEditingProvince(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (province: ProvinceItem) => {
    setEditingProvince(province);
    setDialogOpen(true);
  };

  const handleDelete = (province: ProvinceItem) => {
    modals.openConfirmModal({
      title: 'Xóa tỉnh/thành phố',
      centered: true,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa{' '}
          <Text span fw={600}>
            {province.name} ({province.provinceCode})
          </Text>
          ?
        </Text>
      ),
      labels: { confirm: 'Xóa', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        if (!province.id) return;
        try {
          await deleteProvince.mutateAsync({ id: province.id });
          showSuccess('Xóa tỉnh/thành phố thành công');
          await queryClient.invalidateQueries({ queryKey: getListProvincesQueryKey() });
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  const columns: DataTableColumn<ProvinceItem>[] = [
    {
      key: 'provinceCode',
      title: 'Mã',
      sortable: true,
      width: 100,
      render: (row) => row.provinceCode ?? '—',
    },
    {
      key: 'name',
      title: 'Tên tỉnh/thành phố',
      sortable: true,
      render: (row) => row.name ?? '—',
    },
    {
      key: 'shortName',
      title: 'Tên viết tắt',
      render: (row) => row.shortName || '—',
    },
    {
      key: 'placeType',
      title: 'Loại',
      width: 140,
      render: (row) => row.placeType || '—',
    },
    {
      key: 'country',
      title: 'Quốc gia',
      width: 100,
      render: (row) => row.country || '—',
    },
  ];

  const actions: DataTableAction<ProvinceItem>[] = [
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
    <ListPageLayout
      title="Tỉnh/Thành phố"
      filters={
        <AdminSearch
          testId="provinces"
          placeholder="Tìm theo mã hoặc tên tỉnh/thành phố..."
          value={keyword}
          onSearch={(val) => {
            setKeyword(val);
            setPage(1);
          }}
        />
      }
      actions={
        <Button leftSection={<Plus size={16} />} onClick={handleOpenCreate}>
          Thêm tỉnh/thành phố
        </Button>
      }
    >

      <DataTable
        columns={columns}
        records={items}
        rowKey={(row) => row.id ?? row.provinceCode ?? ''}
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
        emptyText="Chưa có tỉnh/thành phố nào"
        actions={actions}
      />

      <ProvinceFormDialog
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        province={editingProvince}
      />
    </ListPageLayout>
  );
}
