import { Badge, Text } from '@mantine/core';
import { KeyRound, Lock, Pencil, Trash2, Unlock } from 'lucide-react';
import type { UserItem } from '@/shared/api/model';
import { formatDate } from '@/shared/lib/date';
import { DataTable, type DataTableAction, type DataTableColumn } from '@/shared/ui/data-table';
import { USER_ROLE_LABELS } from '../model/userSchemas';
import type { UserConfirmActionType } from './ConfirmUserActionDialog';

export type UserSortField = 'userName' | 'fullName' | 'createdAt';

interface UserTableProps {
  items: UserItem[];
  currentUserId?: string;
  isLoading: boolean;
  isError: boolean;
  isFetching?: boolean;
  onRetry: () => void;
  sortBy: UserSortField;
  isDescending: boolean;
  onSort: (field: UserSortField) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEdit: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
  onConfirmAction: (user: UserItem, action: UserConfirmActionType) => void;
}

export function UserTable({
  items,
  currentUserId,
  isLoading,
  isError,
  onRetry,
  sortBy,
  isDescending,
  onSort,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onEdit,
  onResetPassword,
  onConfirmAction,
}: UserTableProps) {
  const columns: DataTableColumn<UserItem>[] = [
    {
      key: 'userName',
      title: 'Tên đăng nhập',
      sortable: true,
      render: (item) => (
        <Text size="sm" fw={500}>
          {item.userName}
        </Text>
      ),
    },
    {
      key: 'fullName',
      title: 'Họ tên',
      sortable: true,
    },
    {
      key: 'email',
      title: 'Email',
      render: (item) => (
        <Text size="sm" c="dimmed">
          {item.email || '—'}
        </Text>
      ),
    },
    {
      key: 'role',
      title: 'Vai trò',
      render: (item) => {
        const roleLabel = item.role ? ((USER_ROLE_LABELS as Record<string, string>)[item.role] ?? item.role) : '—';
        return <Badge variant="light">{roleLabel}</Badge>;
      },
    },
    {
      key: 'wards',
      title: 'Xã/Phường',
      render: (item) => (
        <Text size="sm" c="dimmed">
          {item.wards?.map((w) => w.name).join(', ') || '—'}
        </Text>
      ),
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (item) =>
        item.isActive ? (
          <Badge color="green" variant="light">
            Hoạt động
          </Badge>
        ) : (
          <Badge color="red" variant="light">
            Đã khóa
          </Badge>
        ),
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      sortable: true,
      render: (item) => (
        <Text size="sm" c="dimmed">
          {formatDate(item.createdAt, false)}
        </Text>
      ),
    },
  ];

  const actions: DataTableAction<UserItem>[] = [
    {
      label: 'Sửa',
      icon: <Pencil size={16} />,
      color: 'blue',
      onClick: onEdit,
    },
    {
      label: 'Khóa tài khoản',
      icon: <Lock size={16} />,
      color: 'orange',
      hidden: (item) => !item.isActive,
      disabled: (item) => item.id === currentUserId,
      onClick: (item) => onConfirmAction(item, 'lock'),
    },
    {
      label: 'Mở khóa tài khoản',
      icon: <Unlock size={16} />,
      color: 'green',
      hidden: (item) => Boolean(item.isActive),
      disabled: (item) => item.id === currentUserId,
      onClick: (item) => onConfirmAction(item, 'unlock'),
    },
    {
      label: 'Đặt lại mật khẩu',
      icon: <KeyRound size={16} />,
      color: 'violet',
      onClick: onResetPassword,
    },
    {
      label: 'Xóa',
      icon: <Trash2 size={16} />,
      color: 'red',
      disabled: (item) => item.id === currentUserId,
      onClick: (item) => onConfirmAction(item, 'delete'),
    },
  ];

  return (
    <DataTable
      columns={columns}
      records={items}
      rowKey="id"
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      sortBy={sortBy}
      isDescending={isDescending}
      onSortChange={(field) => onSort(field as UserSortField)}
      page={currentPage}
      pageSize={pageSize}
      totalRecords={totalItems}
      onPageChange={onPageChange}
      emptyText="Không tìm thấy người dùng nào phù hợp."
      actions={actions}
      minWidth={800}
    />
  );
}
