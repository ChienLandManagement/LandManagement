import { Badge, Button, Group, Select, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Eye, Lock, Pencil, Plus, RefreshCw, Trash2, Unlock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getUser } from '@/entities/session';
import { PERIOD_STATUS_COLORS, PERIOD_STATUS_LABELS, PERIOD_TYPE_LABELS, PeriodFormModal } from '@/features/inventory';
import {
  getListPeriodsQueryKey,
  useDeletePeriod,
  useListPeriods,
  useListWards,
  useSetPeriodStatus,
} from '@/shared/api/generated/api';
import { type InventoryPeriodItem, InventoryPeriodStatus } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { formatDate } from '@/shared/lib/date';
import { DataTable, type DataTableAction, type DataTableColumn } from '@/shared/ui/data-table';
import { ListPageLayout } from '@/shared/ui/templates';

export function InventoryPeriodsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = getUser();
  const isAdmin = user?.role === 'Admin';
  const canWrite = user?.role === 'Admin' || user?.role === 'LandOfficer';

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [wardFilter, setWardFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryPeriodItem | null>(null);

  const deletePeriod = useDeletePeriod();
  const setPeriodStatus = useSetPeriodStatus();

  const { data: wardsData } = useListWards({ PageSize: 200 }, { query: { enabled: isAdmin } });
  const wardOptions = useMemo(
    () =>
      (wardsData?.data?.items ?? [])
        .filter((w) => w.id && w.name)
        .map((w) => ({ value: w.id ?? '', label: w.name ?? '' })),
    [wardsData?.data?.items],
  );

  const { data, isLoading, isFetching, isError, refetch } = useListPeriods({
    WardId: isAdmin && wardFilter ? wardFilter : undefined,
    CurrentPage: page,
    PageSize: pageSize,
    IsDescending: true,
  });

  const items = data?.data?.items ?? [];
  const totalCount = data?.data?.totalItems ?? 0;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryPeriodItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleToggleStatus = async (item: InventoryPeriodItem) => {
    if (!item.id) return;
    const isLocked = item.status === InventoryPeriodStatus.Locked;
    const nextStatus = isLocked ? InventoryPeriodStatus.Open : InventoryPeriodStatus.Locked;
    try {
      await setPeriodStatus.mutateAsync({
        id: item.id,
        data: { status: nextStatus },
      });
      showSuccess(isLocked ? 'Đã mở khóa kỳ kiểm kê' : 'Đã khóa kỳ kiểm kê');
      await queryClient.invalidateQueries({ queryKey: getListPeriodsQueryKey() });
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = (item: InventoryPeriodItem) => {
    modals.openConfirmModal({
      title: 'Xóa kỳ kiểm kê',
      centered: true,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa kỳ kiểm kê ngày chốt{' '}
          <Text span fw={600}>
            {formatDate(item.cutoffDate, false)}
          </Text>
          {item.wardName ? ` (${item.wardName})` : ''}?
        </Text>
      ),
      labels: { confirm: 'Xóa', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        if (!item.id) return;
        try {
          await deletePeriod.mutateAsync({ id: item.id });
          showSuccess('Xóa kỳ kiểm kê thành công');
          await queryClient.invalidateQueries({ queryKey: getListPeriodsQueryKey() });
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  const columns: DataTableColumn<InventoryPeriodItem>[] = [
    ...(isAdmin
      ? [
          {
            key: 'wardName',
            title: 'Xã/phường',
            render: (row: InventoryPeriodItem) => <Text size="sm">{row.wardName ?? '—'}</Text>,
          },
        ]
      : []),
    {
      key: 'cutoffDate',
      title: 'Ngày chốt',
      width: 130,
      render: (row) => (
        <Text size="sm" fw={500}>
          {formatDate(row.cutoffDate, false)}
        </Text>
      ),
    },
    {
      key: 'type',
      title: 'Loại kỳ',
      width: 170,
      render: (row) => <Text size="sm">{(row.type && PERIOD_TYPE_LABELS[row.type]) || row.type || '—'}</Text>,
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: 130,
      render: (row) => {
        const status = row.status ?? '';
        return (
          <Badge color={PERIOD_STATUS_COLORS[status] ?? 'gray'} variant="light">
            {PERIOD_STATUS_LABELS[status] ?? status}
          </Badge>
        );
      },
    },
    {
      key: 'changeCount',
      title: 'Số biến động',
      width: 130,
      align: 'right',
      render: (row) => <Text size="sm">{row.changeCount ?? 0}</Text>,
    },
    {
      key: 'note',
      title: 'Ghi chú',
      render: (row) => (
        <Text size="sm" c="dimmed" lineClamp={1}>
          {row.note ?? '—'}
        </Text>
      ),
    },
  ];

  const actions: DataTableAction<InventoryPeriodItem>[] = [
    {
      label: 'Xem biến động',
      icon: <Eye size={16} />,
      onClick: (row) => {
        if (row.id) {
          navigate({ to: '/inventory-periods/$periodId', params: { periodId: row.id } });
        }
      },
    },
    ...(canWrite
      ? [
          {
            label: 'Khóa kỳ',
            icon: <Lock size={16} />,
            color: 'orange',
            hidden: (row: InventoryPeriodItem) => row.status === InventoryPeriodStatus.Locked,
            onClick: handleToggleStatus,
          },
          {
            label: 'Mở khóa kỳ',
            icon: <Unlock size={16} />,
            color: 'teal',
            hidden: (row: InventoryPeriodItem) => row.status !== InventoryPeriodStatus.Locked,
            onClick: handleToggleStatus,
          },
          {
            label: 'Sửa kỳ',
            icon: <Pencil size={16} />,
            disabled: (row: InventoryPeriodItem) => row.status === InventoryPeriodStatus.Locked,
            onClick: handleOpenEdit,
          },
          {
            label: 'Xóa kỳ',
            icon: <Trash2 size={16} />,
            color: 'red',
            disabled: (row: InventoryPeriodItem) => row.status === InventoryPeriodStatus.Locked,
            onClick: handleDelete,
          },
        ]
      : []),
  ];

  return (
    <ListPageLayout
      title="Kỳ kiểm kê đất đai"
      actions={
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<RefreshCw size={16} />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Làm mới
          </Button>
          {canWrite && (
            <Button leftSection={<Plus size={16} />} onClick={handleOpenCreate}>
              Thêm kỳ
            </Button>
          )}
        </Group>
      }
      filters={
        isAdmin ? (
          <Select
            placeholder="Lọc theo xã/phường"
            data={wardOptions}
            value={wardFilter}
            onChange={(val) => {
              setWardFilter(val);
              setPage(1);
            }}
            searchable
            clearable
            w={260}
          />
        ) : undefined
      }
    >
      <DataTable
        records={items}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        totalRecords={totalCount}
        emptyText="Chưa có kỳ kiểm kê nào"
      />

      <PeriodFormModal opened={modalOpen} onClose={() => setModalOpen(false)} editingItem={editingItem} />
    </ListPageLayout>
  );
}
