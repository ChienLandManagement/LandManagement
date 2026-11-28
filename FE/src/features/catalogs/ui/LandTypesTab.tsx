import { Badge, Box, Button, Group, Text, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Minus, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getUser } from '@/entities/session';
import { getListLandTypesQueryKey, useDeleteLandType, useListLandTypes } from '@/shared/api/generated/api';
import type { LandTypeItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { DataTable, type DataTableAction, type DataTableColumn } from '@/shared/ui/data-table';
import { ListPageLayout } from '@/shared/ui/templates';
import { buildTreeList, getDescendantIds, type TreeNode } from '../model/treeUtils';
import { CatalogTreeSidebar } from './CatalogTreeSidebar';
import { LandTypeFormDialog } from './LandTypeFormDialog';

export function LandTypesTab() {
  const queryClient = useQueryClient();
  const deleteLandType = useDeleteLandType();
  const isAdmin = getUser()?.role === 'Admin';

  const [search, setSearch] = useState('');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LandTypeItem | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useListLandTypes();

  const treeItems = useMemo(() => buildTreeList(data?.data ?? []), [data?.data]);

  const displayedItems = useMemo(() => {
    let list = treeItems;
    if (selectedTreeId) {
      const branchIds = getDescendantIds(treeItems, selectedTreeId);
      list = list.filter((item) => item.id && branchIds.has(item.id));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => item.code?.toLowerCase().includes(q) || item.name?.toLowerCase().includes(q));
    }
    return list;
  }, [treeItems, selectedTreeId, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: LandTypeItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: LandTypeItem) => {
    modals.openConfirmModal({
      title: 'Xóa loại đất',
      centered: true,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa{' '}
          <Text span fw={600}>
            {item.name} ({item.code})
          </Text>
          ?
        </Text>
      ),
      labels: { confirm: 'Xóa', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        if (!item.id) return;
        try {
          await deleteLandType.mutateAsync({ id: item.id });
          showSuccess('Xóa loại đất thành công');
          await queryClient.invalidateQueries({ queryKey: getListLandTypesQueryKey() });
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  const columns: DataTableColumn<TreeNode<LandTypeItem>>[] = [
    {
      key: 'code',
      title: 'Mã',
      width: 110,
      render: (row) => (
        <Text size="sm" fw={row.depth === 0 ? 600 : 400}>
          {row.code ?? '—'}
        </Text>
      ),
    },
    {
      key: 'name',
      title: 'Tên loại đất',
      render: (row) => (
        <Box pl={row.depth * 20}>
          <Text size="sm" fw={row.depth === 0 || row.hasChildren ? 600 : 400}>
            {row.name ?? '—'}
          </Text>
        </Box>
      ),
    },
    {
      key: 'inB02',
      title: 'Có ở biểu 02',
      width: 130,
      align: 'center',
      render: (row) =>
        row.inB02 ? (
          <Badge color="teal" variant="light" leftSection={<Check size={12} />}>
            Có
          </Badge>
        ) : (
          <Minus size={14} opacity={0.4} />
        ),
    },
    {
      key: 'inB05',
      title: 'Có ở biểu 05',
      width: 130,
      align: 'center',
      render: (row) =>
        row.inB05 ? (
          <Badge color="teal" variant="light" leftSection={<Check size={12} />}>
            Có
          </Badge>
        ) : (
          <Minus size={14} opacity={0.4} />
        ),
    },
  ];

  const actions: DataTableAction<TreeNode<LandTypeItem>>[] | undefined = isAdmin
    ? [
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
      ]
    : undefined;

  return (
    <ListPageLayout
      title="Loại đất"
      actions={
        <>
          <TextInput
            placeholder="Tìm mã hoặc tên loại đất..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={260}
          />
          <Button
            variant="default"
            leftSection={<RefreshCw size={16} />}
            onClick={() => void refetch()}
            loading={isFetching && !isLoading}
          >
            Làm mới
          </Button>
          {isAdmin && (
            <Button leftSection={<Plus size={16} />} onClick={handleOpenCreate}>
              Thêm loại đất
            </Button>
          )}
        </>
      }
    >
      <Group align="stretch" gap="md" wrap="nowrap">
        <CatalogTreeSidebar
          title="Cây loại đất"
          items={treeItems}
          selectedId={selectedTreeId}
          onSelect={setSelectedTreeId}
        />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <DataTable
            columns={columns}
            records={displayedItems}
            rowKey="id"
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            emptyText="Chưa có dữ liệu loại đất"
            actions={actions}
          />
        </Box>
      </Group>

      {isAdmin && (
        <LandTypeFormDialog
          opened={dialogOpen}
          onClose={() => setDialogOpen(false)}
          item={editingItem}
          allItems={treeItems}
        />
      )}
    </ListPageLayout>
  );
}
