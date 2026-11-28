import { Button, Stack } from '@mantine/core';
import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/entities/session';
import {
  ConfirmUserActionDialog,
  CreateUserDialog,
  EditUserDialog,
  ResetPasswordDialog,
  type UserConfirmActionType,
  UserFilters,
  type UserSortField,
  UserTable,
} from '@/features/users';
import { useListUsers } from '@/shared/api/generated/api';
import type { UserItem, UserRole } from '@/shared/api/model';
import { APP_NAME } from '@/shared/config/constants';
import { ListPageLayout } from '@/shared/ui/templates';

export function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);

  const [keyword, setKeyword] = useState('');
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

  const { data, isLoading, isError, refetch, isFetching } = useListUsers({
    Query: keyword || undefined,
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

      <ListPageLayout
        title="Quản lý người dùng"
        actions={
          <>
            <UserFilters
              keyword={keyword}
              onSearch={(val) => {
                setKeyword(val);
                setCurrentPage(1);
              }}
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
            <Button
              variant="default"
              leftSection={<RefreshCw size={16} />}
              onClick={() => void refetch()}
              loading={isFetching && !isLoading}
            >
              Làm mới
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Thêm người dùng
            </Button>
          </>
        }
      >
        <Stack gap="md">
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
      </ListPageLayout>

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
