import { ActionIcon, Badge, Button, Group, Select, Switch, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getUser, getWardScope } from '@/entities/session';
import {
  getGetDashboardOverviewQueryKey,
  getListDossiersQueryKey,
  useDeleteDossier,
  useListDossiers,
  useListWards,
} from '@/shared/api/generated/api';
import type { DossierItem, DossierStatus } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { formatDate } from '@/shared/lib/date';
import { DataTable } from '@/shared/ui/data-table';
import { ListPageLayout } from '@/shared/ui/templates';
import { DOSSIER_STATUS_COLORS, DOSSIER_STATUS_LABELS, DOSSIER_STATUS_OPTIONS } from '../model/dossierStatus';
import { DossierFormModal } from './DossierFormModal';

interface DossierListProps {
  /** Mở sẵn bộ lọc quá hạn, dùng khi bấm từ cảnh báo ở trang Tổng quan. */
  initialOverdue?: boolean;
}

export function DossierList({ initialOverdue = false }: DossierListProps) {
  const queryClient = useQueryClient();
  const user = getUser();
  const { isAdmin, wardIds, canPickWard } = getWardScope();
  const canWrite = user?.role === 'Admin' || user?.role === 'LandOfficer';

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchText, 300);
  const [status, setStatus] = useState<string | null>(null);
  const [wardId, setWardId] = useState<string | null>(null);
  const [overdue, setOverdue] = useState(initialOverdue);

  const [modalOpened, setModalOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<DossierItem | null>(null);

  const { data, isFetching } = useListDossiers({
    CurrentPage: page,
    PageSize: pageSize,
    Query: debouncedQuery.trim() || null,
    Status: (status as DossierStatus | null) || null,
    WardId: canPickWard ? wardId || null : null,
    Overdue: overdue ? true : null,
  });
  const { data: wardsData } = useListWards({ PageSize: 200 }, { query: { enabled: canPickWard } });
  const deleteDossier = useDeleteDossier();

  const wardOptions = useMemo(
    () =>
      (wardsData?.data?.items ?? [])
        .filter((w) => w.id && w.name && (isAdmin || wardIds.includes(w.id)))
        .map((w) => ({ value: w.id ?? '', label: w.name ?? '' })),
    [wardsData?.data?.items, isAdmin, wardIds],
  );

  const resetPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const handleDelete = (item: DossierItem) => {
    if (!item.id) return;
    const dossierId = item.id;
    modals.openConfirmModal({
      title: 'Xác nhận xóa hồ sơ',
      children: (
        <Text size="sm">
          Bạn có chắc muốn xóa hồ sơ <b>{item.code}</b> của <b>{item.applicantName}</b>?
        </Text>
      ),
      labels: { confirm: 'Xóa', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteDossier.mutateAsync({ id: dossierId });
          showSuccess('Xóa hồ sơ thành công');
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: getListDossiersQueryKey() }),
            queryClient.invalidateQueries({ queryKey: getGetDashboardOverviewQueryKey() }),
          ]);
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  return (
    <>
      <ListPageLayout
        title="Hồ sơ cấp GCN"
        description="Theo dõi hồ sơ cấp Giấy chứng nhận: đang xử lý, tồn, đã cấp, từ chối, cần bổ sung"
        actions={
          canWrite ? (
            <Button
              leftSection={<Plus size={16} />}
              onClick={() => {
                setEditingItem(null);
                setModalOpened(true);
              }}
            >
              Thêm hồ sơ
            </Button>
          ) : undefined
        }
        filters={
          <Group gap="sm" wrap="wrap" align="center">
            <TextInput
              placeholder="Tìm mã hồ sơ, người nộp, số tờ, số thửa..."
              leftSection={<Search size={16} />}
              value={searchText}
              onChange={(e) => resetPage(setSearchText)(e.currentTarget.value)}
              w={{ base: '100%', sm: 300 }}
            />
            <Select
              placeholder="Trạng thái"
              data={DOSSIER_STATUS_OPTIONS}
              value={status}
              onChange={resetPage(setStatus)}
              clearable
              w={{ base: '100%', sm: 180 }}
            />
            {canPickWard && (
              <Select
                placeholder="Xã/Phường"
                data={wardOptions}
                value={wardId}
                onChange={resetPage(setWardId)}
                searchable
                clearable
                w={{ base: '100%', sm: 200 }}
              />
            )}
            <Switch
              label="Chỉ hồ sơ quá hạn"
              checked={overdue}
              onChange={(e) => resetPage(setOverdue)(e.currentTarget.checked)}
            />
          </Group>
        }
      >
        <DataTable
          records={data?.data?.items ?? []}
          isLoading={isFetching}
          totalRecords={data?.data?.totalItems ?? 0}
          pageSize={pageSize}
          page={page}
          onPageChange={setPage}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageSizeChange={resetPage(setPageSize)}
          rowKey="id"
          columns={[
            { key: 'code', title: 'Mã hồ sơ', width: 130, render: (r) => r.code },
            { key: 'applicantName', title: 'Người nộp', render: (r) => r.applicantName },
            { key: 'parcelLabel', title: 'Thửa đất', render: (r) => r.parcelLabel || '—' },
            {
              key: 'status',
              title: 'Trạng thái',
              width: 210,
              render: (r) => (
                <Group gap={4} wrap="nowrap">
                  <Badge color={DOSSIER_STATUS_COLORS[r.status as DossierStatus] ?? 'gray'} variant="light">
                    {DOSSIER_STATUS_LABELS[r.status as DossierStatus] ?? r.status}
                  </Badge>
                  {r.isOverdue && (
                    <Badge color="red" variant="filled">
                      Quá hạn
                    </Badge>
                  )}
                </Group>
              ),
            },
            { key: 'receivedDate', title: 'Tiếp nhận', width: 110, render: (r) => formatDate(r.receivedDate, false) },
            { key: 'dueDate', title: 'Hạn xử lý', width: 110, render: (r) => formatDate(r.dueDate, false) },
            { key: 'resolvedDate', title: 'Có kết quả', width: 110, render: (r) => formatDate(r.resolvedDate, false) },
            ...(canWrite
              ? [
                  {
                    key: 'actions',
                    title: 'Thao tác',
                    align: 'right' as const,
                    width: 100,
                    render: (record: DossierItem) => (
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          aria-label="Sửa"
                          onClick={() => {
                            setEditingItem(record);
                            setModalOpened(true);
                          }}
                        >
                          <Pencil size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" aria-label="Xóa" onClick={() => handleDelete(record)}>
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Group>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </ListPageLayout>

      <DossierFormModal opened={modalOpened} onClose={() => setModalOpened(false)} editingItem={editingItem} />
    </>
  );
}
