import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from '@tanstack/react-router';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useAuthStore } from '@/entities/session';
import {
  ConfirmUserActionDialog,
  CreateUserDialog,
  EditUserDialog,
  ROLE_LABELS,
  ResetPasswordDialog,
} from '@/features/users';
import { useListUsers } from '@/shared/api/generated/api';
import { UserRole, type UserItem } from '@/shared/api/model';
import { APP_NAME } from '@/shared/config/constants';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';

type SortField = 'userName' | 'fullName' | 'createdAt';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [isDescending, setIsDescending] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    user: UserItem;
    action: 'lock' | 'unlock' | 'delete';
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
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setIsDescending((prev) => !prev);
    } else {
      setSortBy(field);
      setIsDescending(false);
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground" />;
    }
    return isDescending ? (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
    ) : (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
    );
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

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Bộ lọc & Tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên đăng nhập, họ tên, email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>

              <select
                aria-label="Lọc theo vai trò"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={roleFilter ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setRoleFilter(val ? (Number(val) as UserRole) : undefined);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả vai trò</option>
                <option value={UserRole.Admin}>Quản trị viên</option>
                <option value={UserRole.LandOfficer}>Cán bộ địa chính</option>
                <option value={UserRole.Leader}>Lãnh đạo</option>
                <option value={UserRole.Citizen}>Người dân</option>
              </select>

              <select
                aria-label="Lọc theo trạng thái"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={isActiveFilter === undefined ? '' : String(isActiveFilter)}
                onChange={(e) => {
                  const val = e.target.value;
                  setIsActiveFilter(val === '' ? undefined : val === 'true');
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Đã khóa</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {['s1', 's2', 's3', 's4', 's5'].map((key) => (
                  <Skeleton key={key} className="h-12 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <p className="text-sm text-destructive">Không thể tải danh sách người dùng. Vui lòng thử lại.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Không tìm thấy người dùng nào phù hợp.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">
                        <button
                          type="button"
                          onClick={() => handleSort('userName')}
                          className="inline-flex items-center hover:text-foreground"
                        >
                          Tên đăng nhập
                          {renderSortIcon('userName')}
                        </button>
                      </th>
                      <th className="px-4 py-3 font-medium">
                        <button
                          type="button"
                          onClick={() => handleSort('fullName')}
                          className="inline-flex items-center hover:text-foreground"
                        >
                          Họ tên
                          {renderSortIcon('fullName')}
                        </button>
                      </th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Vai trò</th>
                      <th className="px-4 py-3 font-medium">Trạng thái</th>
                      <th className="px-4 py-3 font-medium">
                        <button
                          type="button"
                          onClick={() => handleSort('createdAt')}
                          className="inline-flex items-center hover:text-foreground"
                        >
                          Ngày tạo
                          {renderSortIcon('createdAt')}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => {
                      const isSelf = currentUser?.id === item.id;
                      const roleLabel =
                        (item.role && item.role in ROLE_LABELS
                          ? ROLE_LABELS[item.role as keyof typeof ROLE_LABELS]
                          : item.role) ?? '—';

                      return (
                        <tr key={item.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{item.userName}</td>
                          <td className="px-4 py-3">{item.fullName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.email || '—'}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">{roleLabel}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            {item.isActive ? (
                              <Badge variant="default">Hoạt động</Badge>
                            ) : (
                              <Badge variant="destructive">Đã khóa</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" title="Sửa" onClick={() => setEditUser(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                title={item.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                disabled={isSelf}
                                onClick={() =>
                                  setConfirmAction({
                                    user: item,
                                    action: item.isActive ? 'lock' : 'unlock',
                                  })
                                }
                              >
                                {item.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                title="Đặt lại mật khẩu"
                                onClick={() => setResetPasswordUser(item)}
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                title="Xóa"
                                disabled={isSelf}
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  setConfirmAction({
                                    user: item,
                                    action: 'delete',
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoading && !isError && totalItems > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t px-4 py-3 text-sm">
                <p className="text-muted-foreground">
                  Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} trên tổng
                  số {totalItems} người dùng
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
