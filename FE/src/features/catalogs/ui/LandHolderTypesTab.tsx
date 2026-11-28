import { Badge, Box, Button, Group, Tabs, Text, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getUser } from '@/entities/session';
import {
  getListLandHolderTypesQueryKey,
  useDeleteLandHolderType,
  useListLandHolderTypes,
} from '@/shared/api/generated/api';
import type { LandHolderTypeItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { DataTable, type DataTableAction, type DataTableColumn } from '@/shared/ui/data-table';
import { ListPageLayout } from '@/shared/ui/templates';
import { LAND_HOLDER_KIND_LABELS, toLandHolderKind } from '../model/catalogSchemas';
import { buildTreeList, getDescendantIds, type TreeNode } from '../model/treeUtils';
import { CatalogTreeSidebar } from './CatalogTreeSidebar';
import { LandHolderTypeFormDialog } from './LandHolderTypeFormDialog';

type KindFilter = 'all' | 'User' | 'Manager';

export function LandHolderTypesTab() {
  const queryClient = useQueryClient();
  const deleteLandHolderType = useDeleteLandHolderType();
  const isAdmin = getUser()?.role === 'Admin';

  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LandHolderTypeItem | null>(null);

  const queryParams = kindFilter === 'all' ? undefined : { Kind: toLandHolderKind(kindFilter) };

  const { data, isLoading, isFetching, isError, refetch } = useListLandHolderTypes(queryParams);

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

  const handleOpenEdit = (item: LandHolderTypeItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: LandHolderTypeItem) => {
    modals.openConfirmModal({
      title: 'Xóa đối tượng sử dụng/quản lý đất',
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
          await deleteLandHolderType.mutateAsync({ id: item.id });
          showSuccess('Xóa đối tượng sử dụng/quản lý đất thành công');
          await queryClient.invalidateQueries({ queryKey: getListLandHolderTypesQueryKey() });
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  const columns: DataTableColumn<TreeNode<LandHolderTypeItem>>[] = [
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
      title: 'Tên đối tượng',
      render: (row) => (
        <Box pl={row.depth * 20}>
          <Text size="sm" fw={row.depth === 0 || row.hasChildren ? 600 : 400}>
            {row.name ?? '—'}
          </Text>
        </Box>
      ),
    },
    {
      key: 'kind',
      title: 'Nhóm',
      width: 220,
      render: (row) => {
        const label = row.kind ? (LAND_HOLDER_KIND_LABELS[row.kind] ?? row.kind) : '—';
        const color = row.kind === 'User' ? 'blue' : 'orange';
        return (
          <Badge color={color} variant="light">
            {label}
          </Badge>
        );
      },
    },
  ];

  const actions: DataTableAction<TreeNode<LandHolderTypeItem>>[] | undefined = isAdmin
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
      title="Đối tượng đất"
      actions={
        <>
          <TextInput
            placeholder="Tìm mã hoặc tên đối tượng..."
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
              Thêm đối tượng
            </Button>
          )}
        </>
      }
    >
      <Tabs value={kindFilter} onChange={(val) => setKindFilter((val as KindFilter) || 'all')} mb="sm">
        <Tabs.List>
          <Tabs.Tab value="all">Tất cả</Tabs.Tab>
          <Tabs.Tab value="User">Người sử dụng đất</Tabs.Tab>
          <Tabs.Tab value="Manager">Người được giao quản lý</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Group align="stretch" gap="md" wrap="nowrap">
        <CatalogTreeSidebar
          title="Cây đối tượng"
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
            emptyText="Chưa có dữ liệu đối tượng sử dụng/quản lý đất"
            actions={actions}
          />
        </Box>
      </Group>

      {isAdmin && (
        <LandHolderTypeFormDialog
          opened={dialogOpen}
          onClose={() => setDialogOpen(false)}
          item={editingItem}
          allItems={treeItems}
        />
      )}
    </ListPageLayout>
  );
}
