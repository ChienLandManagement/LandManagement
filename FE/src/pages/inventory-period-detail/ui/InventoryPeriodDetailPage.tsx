import { Alert, Badge, Button, Group, List, Paper, ScrollArea, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft, Copy, FileSpreadsheet, Lock, Pencil, Plus, Trash2, Unlock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getUser } from '@/entities/session';
import {
  EntriesGrid,
  formatArea,
  ImportWorkbookModal,
  LandChangeFormModal,
  PERIOD_STATUS_COLORS,
  PERIOD_STATUS_LABELS,
  PERIOD_TYPE_LABELS,
  PeriodChecksPanel,
} from '@/features/inventory';
import {
  getCheckPeriodQueryKey,
  getGetEntriesQueryKey,
  getListLandChangesQueryKey,
  getListPeriodsQueryKey,
  useCheckPeriod,
  useDeleteLandChange,
  useGetEntries,
  useListLandChanges,
  useListLandHolderTypes,
  useListLandTypes,
  useListPeriods,
  usePrefillPeriod,
  useSetPeriodStatus,
} from '@/shared/api/generated/api';
import { InventoryPeriodStatus, type LandChangeItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { formatDate } from '@/shared/lib/date';
import { DataTable, type DataTableAction, type DataTableColumn } from '@/shared/ui/data-table';
import { DetailLayout } from '@/shared/ui/templates';

export function InventoryPeriodDetailPage() {
  const { periodId } = useParams({ strict: false }) as { periodId: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = getUser();
  const canWrite = user?.role === 'Admin' || user?.role === 'LandOfficer';

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LandChangeItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('changes');
  const [b01Dirty, setB01Dirty] = useState(false);
  const [b02Dirty, setB02Dirty] = useState(false);

  const setPeriodStatus = useSetPeriodStatus();
  const deleteLandChange = useDeleteLandChange();
  const prefillPeriod = usePrefillPeriod();

  const { data: periodsData } = useListPeriods({ PageSize: 200 });
  const period = useMemo(
    () => (periodsData?.data?.items ?? []).find((p) => p.id === periodId),
    [periodsData?.data?.items, periodId],
  );

  const isLocked = period?.status === InventoryPeriodStatus.Locked;

  const { data, isLoading, isError, refetch } = useListLandChanges({
    PeriodId: periodId,
    CurrentPage: page,
    PageSize: pageSize,
  });

  const { data: entriesData, isLoading: entriesLoading } = useGetEntries(periodId, {
    query: { enabled: Boolean(periodId) },
  });
  const {
    data: checksData,
    isLoading: checksLoading,
    isFetching: checksFetching,
    refetch: refetchChecks,
  } = useCheckPeriod(periodId, {
    query: { enabled: Boolean(periodId) },
  });
  const { data: landTypesData } = useListLandTypes();
  const { data: holderTypesData } = useListLandHolderTypes();

  const entries = entriesData?.data;
  const checks = checksData?.data;
  const issueCount = checks?.issues?.length ?? 0;
  const landTypes = landTypesData?.data ?? [];
  const holderTypes = holderTypesData?.data ?? [];

  const handleTabChange = (nextTab: string | null) => {
    if (!nextTab || nextTab === activeTab) return;
    const isCurrentDirty = (activeTab === 'b01' && b01Dirty) || (activeTab === 'b02' && b02Dirty);
    if (!isCurrentDirty) {
      setActiveTab(nextTab);
      return;
    }
    modals.openConfirmModal({
      title: 'Thay đổi chưa được lưu',
      centered: true,
      children: (
        <Text size="sm">
          Bạn có các ô số liệu chưa lưu trên lưới hiện tại. Nếu chuyển tab, các thay đổi chưa lưu sẽ bị hủy. Bạn có chắc
          chắn muốn tiếp tục?
        </Text>
      ),
      labels: { confirm: 'Chuyển tab', cancel: 'Ở lại' },
      confirmProps: { color: 'orange' },
      onConfirm: () => {
        setActiveTab(nextTab);
      },
    });
  };

  const handlePrefill = () => {
    modals.openConfirmModal({
      title: 'Khởi tạo số liệu từ kỳ trước',
      centered: true,
      children: (
        <Text size="sm">
          Hệ thống sẽ sao chép số liệu của kỳ kiểm kê liền trước cùng xã và áp dụng các biến động đã ghi trong kỳ này.
          Lưu ý: các biến động chưa chọn đối tượng sẽ chưa được áp dụng.
        </Text>
      ),
      labels: { confirm: 'Khởi tạo', cancel: 'Hủy' },
      onConfirm: async () => {
        try {
          const response = await prefillPeriod.mutateAsync({ periodId });
          const warnings = response.data?.warnings ?? [];
          showSuccess('Khởi tạo số liệu từ kỳ trước thành công');
          if (warnings.length > 0) {
            modals.open({
              title: `Cảnh báo khi khởi tạo (${warnings.length})`,
              centered: true,
              children: (
                <ScrollArea.Autosize mah={260}>
                  <List size="sm" spacing={4}>
                    {warnings.map((w) => (
                      <List.Item key={w}>{w}</List.Item>
                    ))}
                  </List>
                </ScrollArea.Autosize>
              ),
            });
          }
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: getGetEntriesQueryKey(periodId) }),
            queryClient.invalidateQueries({ queryKey: getCheckPeriodQueryKey(periodId) }),
            queryClient.invalidateQueries({ queryKey: getListLandChangesQueryKey() }),
            queryClient.invalidateQueries({ queryKey: getListPeriodsQueryKey() }),
          ]);
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  const items = data?.data?.items ?? [];
  const totalCount = data?.data?.totalItems ?? 0;

  const handleToggleStatus = async () => {
    if (!period?.id) return;
    const nextStatus = isLocked ? InventoryPeriodStatus.Open : InventoryPeriodStatus.Locked;
    try {
      await setPeriodStatus.mutateAsync({
        id: period.id,
        data: { status: nextStatus },
      });
      showSuccess(isLocked ? 'Đã mở khóa kỳ kiểm kê' : 'Đã khóa kỳ kiểm kê');
      await queryClient.invalidateQueries({ queryKey: getListPeriodsQueryKey() });
    } catch (error) {
      showError(error);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LandChangeItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: LandChangeItem) => {
    modals.openConfirmModal({
      title: 'Xóa biến động đất đai',
      centered: true,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa biến động ngày{' '}
          <Text span fw={600}>
            {formatDate(item.changeDate, false)}
          </Text>{' '}
          ({formatArea(item.area)} ha)?
        </Text>
      ),
      labels: { confirm: 'Xóa', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        if (!item.id) return;
        try {
          await deleteLandChange.mutateAsync({ id: item.id });
          showSuccess('Xóa biến động thành công');
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: getListLandChangesQueryKey() }),
            queryClient.invalidateQueries({ queryKey: getListPeriodsQueryKey() }),
            queryClient.invalidateQueries({ queryKey: getGetEntriesQueryKey(periodId) }),
            queryClient.invalidateQueries({ queryKey: getCheckPeriodQueryKey(periodId) }),
          ]);
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  const columns: DataTableColumn<LandChangeItem>[] = [
    {
      key: 'changeDate',
      title: 'Ngày biến động',
      width: 130,
      render: (row) => (
        <Text size="sm" fw={500}>
          {formatDate(row.changeDate, false)}
        </Text>
      ),
    },
    {
      key: 'fromLandType',
      title: 'Loại đất cũ',
      render: (row) =>
        row.fromLandTypeId ? (
          <Text size="sm">
            {row.fromLandTypeCode} - {row.fromLandTypeName}
          </Text>
        ) : (
          <Badge color="teal" variant="light">
            Tăng khác
          </Badge>
        ),
    },
    {
      key: 'toLandType',
      title: 'Loại đất mới',
      render: (row) =>
        row.toLandTypeId ? (
          <Text size="sm">
            {row.toLandTypeCode} - {row.toLandTypeName}
          </Text>
        ) : (
          <Badge color="orange" variant="light">
            Giảm khác
          </Badge>
        ),
    },
    {
      key: 'area',
      title: 'Diện tích (ha)',
      width: 130,
      align: 'right',
      render: (row) => (
        <Text size="sm" fw={500}>
          {formatArea(row.area)}
        </Text>
      ),
    },
    {
      key: 'holderTypeName',
      title: 'Đối tượng',
      render: (row) => <Text size="sm">{row.holderTypeName ?? '—'}</Text>,
    },
    {
      key: 'source',
      title: 'Nguồn',
      width: 120,
      render: (row) =>
        row.source === 'Import' ? (
          <Badge color="blue" variant="light">
            Nhập Excel
          </Badge>
        ) : (
          <Badge color="gray" variant="light">
            Nhập tay
          </Badge>
        ),
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

  const actions: DataTableAction<LandChangeItem>[] = canWrite
    ? [
        {
          label: isLocked ? 'Kỳ đã khóa' : 'Sửa',
          icon: <Pencil size={16} />,
          disabled: () => isLocked,
          onClick: handleOpenEdit,
        },
        {
          label: isLocked ? 'Kỳ đã khóa' : 'Xóa',
          icon: <Trash2 size={16} />,
          color: 'red',
          disabled: () => isLocked,
          onClick: handleDelete,
        },
      ]
    : [];

  return (
    <DetailLayout
      title={`Chi tiết kỳ kiểm kê${period?.cutoffDate ? ` — ${formatDate(period.cutoffDate, false)}` : ''}`}
      subtitle={period?.wardName ? `Xã/phường: ${period.wardName}` : undefined}
      actions={
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<ArrowLeft size={16} />}
            onClick={() => navigate({ to: '/inventory-periods' })}
          >
            Quay lại
          </Button>
          {canWrite && period && (
            <Button
              variant="light"
              color={isLocked ? 'teal' : 'orange'}
              leftSection={isLocked ? <Unlock size={16} /> : <Lock size={16} />}
              onClick={handleToggleStatus}
              loading={setPeriodStatus.isPending}
            >
              {isLocked ? 'Mở khóa kỳ' : 'Khóa kỳ'}
            </Button>
          )}
          {canWrite && !isLocked && (
            <>
              <Button
                variant="light"
                leftSection={<FileSpreadsheet size={16} />}
                onClick={() => setImportModalOpen(true)}
              >
                Nhập từ Excel
              </Button>
              <Button
                variant="light"
                color="teal"
                leftSection={<Copy size={16} />}
                onClick={handlePrefill}
                loading={prefillPeriod.isPending}
              >
                Khởi tạo từ kỳ trước
              </Button>
              <Button leftSection={<Plus size={16} />} onClick={handleOpenCreate}>
                Ghi biến động
              </Button>
            </>
          )}
        </Group>
      }
    >
      <Stack gap="md">
        {period && (
          <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <div>
                <Text size="xs" c="dimmed">
                  Xã/phường
                </Text>
                <Text size="sm" fw={500}>
                  {period.wardName ?? '—'}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Ngày chốt số liệu
                </Text>
                <Text size="sm" fw={500}>
                  {formatDate(period.cutoffDate, false)}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Loại kỳ
                </Text>
                <Text size="sm" fw={500}>
                  {(period.type && PERIOD_TYPE_LABELS[period.type]) || period.type || '—'}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Trạng thái
                </Text>
                <Badge color={PERIOD_STATUS_COLORS[period.status ?? ''] ?? 'gray'} variant="light" mt={2}>
                  {PERIOD_STATUS_LABELS[period.status ?? ''] ?? period.status}
                </Badge>
              </div>
            </SimpleGrid>
            {period.note && (
              <Text size="sm" c="dimmed" mt="sm">
                Ghi chú: {period.note}
              </Text>
            )}
          </Paper>
        )}

        {isLocked && (
          <Alert color="orange" variant="light" icon={<AlertTriangle size={16} />}>
            Kỳ đã khóa. Mở khóa kỳ để thêm, sửa hoặc xóa biến động.
          </Alert>
        )}

        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List mb="md">
            <Tabs.Tab value="changes">Biến động</Tabs.Tab>
            <Tabs.Tab value="b01">Số liệu B01 (diện tích)</Tabs.Tab>
            <Tabs.Tab value="b02">Số liệu B02 (số lượng)</Tabs.Tab>
            <Tabs.Tab
              value="checks"
              rightSection={
                issueCount > 0 ? (
                  <Badge size="xs" circle color="orange">
                    {issueCount}
                  </Badge>
                ) : null
              }
            >
              Kiểm tra
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="changes">
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
              emptyText="Chưa có biến động đất đai nào trong kỳ này"
            />
          </Tabs.Panel>

          <Tabs.Panel value="b01">
            <EntriesGrid
              periodId={periodId}
              mode="B01"
              serverCells={entries?.areas ?? []}
              landTypes={landTypes}
              holderTypes={holderTypes}
              readOnly={!canWrite || isLocked}
              isLoading={entriesLoading}
              onDirtyChange={setB01Dirty}
            />
          </Tabs.Panel>

          <Tabs.Panel value="b02">
            <EntriesGrid
              periodId={periodId}
              mode="B02"
              serverCells={entries?.counts ?? []}
              landTypes={landTypes}
              holderTypes={holderTypes}
              readOnly={!canWrite || isLocked}
              isLoading={entriesLoading}
              onDirtyChange={setB02Dirty}
            />
          </Tabs.Panel>

          <Tabs.Panel value="checks">
            <PeriodChecksPanel
              hasAreas={checks?.hasAreas}
              hasCounts={checks?.hasCounts}
              issues={checks?.issues}
              isLoading={checksLoading}
              isFetching={checksFetching}
              onRefetch={refetchChecks}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <LandChangeFormModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        periodId={periodId}
        cutoffDate={period?.cutoffDate}
        editingItem={editingItem}
      />

      <ImportWorkbookModal opened={importModalOpen} onClose={() => setImportModalOpen(false)} periodId={periodId} />
    </DetailLayout>
  );
}
