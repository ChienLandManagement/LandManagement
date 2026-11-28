import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Plus } from 'lucide-react';
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
import type { UserRole, UserItem } from '@/shared/api/model';
import { APP_NAME } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

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

      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/home">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Trang chủ
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
              <p className="text-sm text-muted-foreground">Quản lý tài khoản, phân quyền và trạng thái hoạt động</p>
            </div>
          </div>

          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>

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
      </div>

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
