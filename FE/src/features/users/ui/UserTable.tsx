import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Pagination,
  Skeleton,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  KeyRound,
  Lock,
  Pencil,
  RefreshCw,
  Trash2,
  Unlock,
} from 'lucide-react';
import type { UserItem } from '@/shared/api/model';
import { formatDate } from '@/shared/lib/date';
import { USER_ROLE_LABELS } from '../model/userSchemas';
import type { UserConfirmActionType } from './ConfirmUserActionDialog';

export type UserSortField = 'userName' | 'fullName' | 'createdAt';

interface UserTableProps {
  items: UserItem[];
  currentUserId?: string;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
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
  isFetching,
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
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const renderSortIcon = (field: UserSortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={14} />;
    }
    return isDescending ? <ArrowDown size={14} /> : <ArrowUp size={14} />;
  };

  return (
    <Card withBorder radius="md" padding={0}>
      {isLoading ? (
        <Stack gap="sm" p="md">
          {['s1', 's2', 's3', 's4', 's5'].map((key) => (
            <Skeleton key={key} height={44} radius="sm" />
          ))}
        </Stack>
      ) : isError ? (
        <Stack align="center" justify="center" gap="sm" py="xl" px="md">
          <Text size="sm" c="red">
            Không thể tải danh sách người dùng. Vui lòng thử lại.
          </Text>
          <Button variant="default" size="sm" leftSection={<RefreshCw size={14} />} onClick={onRetry} loading={isFetching}>
            Thử lại
          </Button>
        </Stack>
      ) : items.length === 0 ? (
        <Text py="xl" ta="center" size="sm" c="dimmed">
          Không tìm thấy người dùng nào phù hợp.
        </Text>
      ) : (
        <>
          <Table.ScrollContainer minWidth={800}>
            <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <UnstyledButton onClick={() => onSort('userName')}>
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                          Tên đăng nhập
                        </Text>
                        {renderSortIcon('userName')}
                      </Group>
                    </UnstyledButton>
                  </Table.Th>
                  <Table.Th>
                    <UnstyledButton onClick={() => onSort('fullName')}>
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                          Họ tên
                        </Text>
                        {renderSortIcon('fullName')}
                      </Group>
                    </UnstyledButton>
                  </Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Vai trò</Table.Th>
                  <Table.Th>Xã/Phường</Table.Th>
                  <Table.Th>Trạng thái</Table.Th>
                  <Table.Th>
                    <UnstyledButton onClick={() => onSort('createdAt')}>
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                          Ngày tạo
                        </Text>
                        {renderSortIcon('createdAt')}
                      </Group>
                    </UnstyledButton>
                  </Table.Th>
                  <Table.Th ta="right">Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item) => {
                  const isSelf = currentUserId === item.id;
                  const roleLabel =
                    (item.role && item.role in USER_ROLE_LABELS
                      ? USER_ROLE_LABELS[item.role as keyof typeof USER_ROLE_LABELS]
                      : item.role) ?? '—';

                  return (
                    <Table.Tr key={item.id}>
                      <Table.Td fw={500}>{item.userName}</Table.Td>
                      <Table.Td>{item.fullName}</Table.Td>
                      <Table.Td c="dimmed">{item.email || '—'}</Table.Td>
                      <Table.Td>
                        <Badge variant="light">{roleLabel}</Badge>
                      </Table.Td>
                      <Table.Td c="dimmed">{item.wardName || '-'}</Table.Td>
                      <Table.Td>
                        {item.isActive ? (
                          <Badge color="green" variant="light">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge color="red" variant="light">
                            Đã khóa
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td c="dimmed">{formatDate(item.createdAt, false)}</Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          <ActionIcon variant="subtle" color="gray" aria-label="Sửa" title="Sửa" onClick={() => onEdit(item)}>
                            <Pencil size={16} />
                          </ActionIcon>

                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            aria-label={item.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            title={item.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            disabled={isSelf}
                            onClick={() => onConfirmAction(item, item.isActive ? 'lock' : 'unlock')}
                          >
                            {item.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                          </ActionIcon>

                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            aria-label="Đặt lại mật khẩu"
                            title="Đặt lại mật khẩu"
                            onClick={() => onResetPassword(item)}
                          >
                            <KeyRound size={16} />
                          </ActionIcon>

                          <ActionIcon
                            variant="subtle"
                            color="red"
                            aria-label="Xóa"
                            title="Xóa"
                            disabled={isSelf}
                            onClick={() => onConfirmAction(item, 'delete')}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {totalPages > 1 && (
            <Group justify="space-between" p="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
              <Text size="xs" c="dimmed">
                Trang {currentPage} / {totalPages} (Tổng {totalItems} tài khoản)
              </Text>
              <Pagination total={totalPages} value={currentPage} onChange={onPageChange} size="sm" />
            </Group>
          )}
        </>
      )}
    </Card>
  );
}
