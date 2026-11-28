import { ActionIcon, Badge, Button, Group, Select, Switch, Text, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getUser } from '@/entities/session';
import { formatArea } from '@/features/inventory';
import {
  getListParcelsQueryKey,
  useDeleteParcel,
  useListLandTypes,
  useListParcels,
  useListWards,
} from '@/shared/api/generated/api';
import type { ParcelItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { DataTable } from '@/shared/ui/data-table';
import { ListPageLayout } from '@/shared/ui/templates';
import { getLeafLandTypeOptions } from '../model/leafOptions';
import { ParcelFormModal } from './ParcelFormModal';

export function ParcelsList() {
  const queryClient = useQueryClient();
  const user = getUser();
  const isAdmin = user?.role === 'Admin';
  const canWrite = user?.role === 'Admin' || user?.role === 'LandOfficer';

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchText, 300);
  const [landTypeId, setLandTypeId] = useState<string | null>(null);
  const [wardId, setWardId] = useState<string | null>(null);
  const [missingInfo, setMissingInfo] = useState(false);

  const [modalOpened, setModalOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<ParcelItem | null>(null);

  const { data: parcelsData, isFetching } = useListParcels({
    CurrentPage: page,
    PageSize: pageSize,
    Query: debouncedQuery.trim() || null,
    LandTypeId: landTypeId || null,
    WardId: isAdmin ? wardId || null : null,
    MissingInfo: missingInfo ? true : null,
  });

  const { data: landTypesData } = useListLandTypes({});
  const { data: wardsData } = useListWards({ PageSize: 200 }, { query: { enabled: isAdmin } });
  const deleteParcel = useDeleteParcel();

  const landTypeOptions = useMemo(() => getLeafLandTypeOptions(landTypesData?.data ?? []), [landTypesData?.data]);

  const wardOptions = useMemo(
    () =>
      (wardsData?.data?.items ?? [])
        .filter((w) => w.id && w.name)
        .map((w) => ({ value: w.id ?? '', label: w.name ?? '' })),
    [wardsData?.data?.items],
  );

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpened(true);
  };

  const handleOpenEdit = (item: ParcelItem) => {
    setEditingItem(item);
    setModalOpened(true);
  };

  const handleDelete = (item: ParcelItem) => {
    if (!item.id) return;
    const parcelId = item.id;
    modals.openConfirmModal({
      title: 'Xác nhận xóa thửa đất',
      children: (
        <Text size="sm">
          Bạn có chắc muốn xóa thửa đất số tờ <b>{item.mapSheet}</b>, số thửa <b>{item.parcelNumber}</b>?
        </Text>
      ),
      labels: { confirm: 'Xóa', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteParcel.mutateAsync({ id: parcelId });
          showSuccess('Xóa thửa đất thành công');
          await queryClient.invalidateQueries({ queryKey: getListParcelsQueryKey() });
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  const items = parcelsData?.data?.items ?? [];
  const totalRecords = parcelsData?.data?.totalItems ?? 0;

  return (
    <>
      <ListPageLayout
        title="Quản lý thửa đất"
        description="Danh sách thửa đất theo tờ bản đồ, loại đất và người sử dụng"
        actions={
          canWrite ? (
            <Button leftSection={<Plus size={16} />} onClick={handleOpenCreate}>
              Thêm thửa đất
            </Button>
          ) : undefined
        }
        filters={
          <Group gap="sm" wrap="wrap" align="center">
            <TextInput
              placeholder="Tìm số tờ, số thửa, người sử dụng, địa chỉ..."
              leftSection={<Search size={16} />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.currentTarget.value);
                setPage(1);
              }}
              w={{ base: '100%', sm: 300 }}
            />

            <Select
              placeholder="Loại đất"
              data={landTypeOptions}
              value={landTypeId}
              onChange={(val) => {
                setLandTypeId(val);
                setPage(1);
              }}
              searchable
              clearable
              w={{ base: '100%', sm: 240 }}
            />

            {isAdmin && (
              <Select
                placeholder="Xã/Phường"
                data={wardOptions}
                value={wardId}
                onChange={(val) => {
                  setWardId(val);
                  setPage(1);
                }}
                searchable
                clearable
                w={{ base: '100%', sm: 200 }}
              />
            )}

            <Switch
              label="Chỉ thửa còn thiếu thông tin"
              checked={missingInfo}
              onChange={(e) => {
                setMissingInfo(e.currentTarget.checked);
                setPage(1);
              }}
            />
          </Group>
        }
      >
        <DataTable
          records={items}
          isLoading={isFetching}
          totalRecords={totalRecords}
          pageSize={pageSize}
          page={page}
          onPageChange={setPage}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageSizeChange={(nextSize) => {
            setPageSize(nextSize);
            setPage(1);
          }}
          rowKey="id"
          columns={[
            {
              key: 'mapSheet',
              title: 'Số tờ',
              width: 90,
              render: (record) => record.mapSheet || '—',
            },
            {
              key: 'parcelNumber',
              title: 'Số thửa',
              width: 90,
              render: (record) => record.parcelNumber || '—',
            },
            {
              key: 'area',
              title: 'Diện tích (ha)',
              align: 'right',
              width: 130,
              render: (record) => formatArea(record.area),
            },
            {
              key: 'landTypeName',
              title: 'Loại đất',
              render: (record) =>
                record.landTypeCode || record.landTypeName
                  ? `${record.landTypeCode ?? ''} - ${record.landTypeName ?? ''}`
                  : '—',
            },
            {
              key: 'holderName',
              title: 'Người sử dụng',
              render: (record) => record.holderName || '—',
            },
            {
              key: 'holderTypeName',
              title: 'Đối tượng',
              render: (record) => record.holderTypeName || '—',
            },
            {
              key: 'address',
              title: 'Địa chỉ',
              render: (record) => record.address || '—',
            },
            {
              key: 'warnings',
              title: 'Cảnh báo',
              width: 140,
              render: (record) => {
                const warnings = record.warnings ?? [];
                if (warnings.length === 0) return null;
                return (
                  <Tooltip label={warnings.join('; ')} multiline maw={280}>
                    <Badge color="orange" variant="light">
                      Thiếu thông tin
                    </Badge>
                  </Tooltip>
                );
              },
            },
            ...(canWrite
              ? [
                  {
                    key: 'actions',
                    title: 'Thao tác',
                    align: 'right' as const,
                    width: 100,
                    render: (record: ParcelItem) => (
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          aria-label="Sửa"
                          onClick={() => handleOpenEdit(record)}
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

      <ParcelFormModal opened={modalOpened} onClose={() => setModalOpened(false)} editingItem={editingItem} />
    </>
  );
}
