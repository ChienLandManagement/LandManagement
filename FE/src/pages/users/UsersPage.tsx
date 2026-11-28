import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/entities/session';
import {
  ConfirmUserActionDialog,
  CreateUserDialog,
  EditUserDialog,
  ResetPasswordDialog,
  UserFilters,
  UserTable,
  type UserConfirmActionType,
  type UserSortField,
} from '@/features/users';
import { useListUsers } from '@/shared/api/generated/api';
import type { UserItem, UserRole } from '@/shared/api/model';
import { APP_NAME } from '@/shared/config/constants';

export function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<UserSortField>('createdAt');
  const [isDescending, setIsDescending] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    user: UserItem;
    action: UserConfirmActionType;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, refetch, isFetching } = useListUsers({
    Query: debouncedQuery || undefined,
    Role: roleFilter ?? undefined,
    IsActive: isActiveFilter ?? undefined,
    CurrentPage: currentPage,
    PageSize: pageSize,
    SortBy: sortBy,
    IsDescending: isDescending,
  });

  const paged = data?.data;
  const items = paged?.items ?? [];
  const totalItems = paged?.totalItems ?? 0;

  const handleSort = (field: UserSortField) => {
    if (sortBy === field) {
      setIsDescending((prev) => !prev);
    } else {
      setSortBy(field);
      setIsDescending(false);
    }
    setCurrentPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Quản lý người dùng - {APP_NAME}</title>
      </Helmet>

      <Container size="xl" py="lg">
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="md">
              <Button component={Link} to="/home" variant="default" size="sm" leftSection={<ArrowLeft size={16} />}>
                Trang chủ
              </Button>
              <div>
                <Title order={1} size="h2">
                  Quản lý người dùng
                </Title>
                <Text size="sm" c="dimmed">
                  Quản lý tài khoản, phân quyền và trạng thái hoạt động
                </Text>
              </div>
            </Group>

            <Button leftSection={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Thêm người dùng
            </Button>
          </Group>

          <UserFilters
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            roleFilter={roleFilter}
            onRoleFilterChange={(role) => {
              setRoleFilter(role);
              setCurrentPage(1);
            }}
            isActiveFilter={isActiveFilter}
            onIsActiveFilterChange={(isActive) => {
              setIsActiveFilter(isActive);
              setCurrentPage(1);
            }}
          />

          <UserTable
            items={items}
            currentUserId={currentUser?.id}
            isLoading={isLoading}
            isError={isError}
            isFetching={isFetching}
            onRetry={() => refetch()}
            sortBy={sortBy}
            isDescending={isDescending}
            onSort={handleSort}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onEdit={setEditUser}
            onResetPassword={setResetPasswordUser}
            onConfirmAction={(user, action) => setConfirmAction({ user, action })}
          />
        </Stack>
      </Container>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserDialog
        user={editUser}
        open={Boolean(editUser)}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
      />
      <ResetPasswordDialog
        user={resetPasswordUser}
        open={Boolean(resetPasswordUser)}
        onOpenChange={(open) => {
          if (!open) setResetPasswordUser(null);
        }}
      />
      <ConfirmUserActionDialog
        user={confirmAction?.user ?? null}
        action={confirmAction?.action ?? null}
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      />
    </>
  );
}

export default UsersPage;
