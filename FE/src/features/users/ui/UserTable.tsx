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
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
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
      return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground" />;
    }
    return isDescending ? (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
    ) : (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
    );
  };

  return (
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
            <Button variant="outline" size="sm" onClick={onRetry} disabled={isFetching}>
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
                      onClick={() => onSort('userName')}
                      className="inline-flex items-center hover:text-foreground"
                    >
                      Tên đăng nhập
                      {renderSortIcon('userName')}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => onSort('fullName')}
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
                      onClick={() => onSort('createdAt')}
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
                  const isSelf = currentUserId === item.id;
                  const roleLabel =
                    (item.role && item.role in USER_ROLE_LABELS
                      ? USER_ROLE_LABELS[item.role as keyof typeof USER_ROLE_LABELS]
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
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt, false)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" title="Sửa" onClick={() => onEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title={item.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            disabled={isSelf}
                            onClick={() => onConfirmAction(item, item.isActive ? 'lock' : 'unlock')}
                          >
                            {item.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Đặt lại mật khẩu"
                            onClick={() => onResetPassword(item)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xóa"
                            disabled={isSelf}
                            className="text-destructive hover:text-destructive"
                            onClick={() => onConfirmAction(item, 'delete')}
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
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
