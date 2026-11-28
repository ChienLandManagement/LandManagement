import { Search } from 'lucide-react';
import { UserRole } from '@/shared/api/model';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

interface UserFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  roleFilter: UserRole | undefined;
  onRoleFilterChange: (role: UserRole | undefined) => void;
  isActiveFilter: boolean | undefined;
  onIsActiveFilterChange: (isActive: boolean | undefined) => void;
}

export function UserFilters({
  searchInput,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  isActiveFilter,
  onIsActiveFilterChange,
}: UserFiltersProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            aria-label="Lọc theo vai trò"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={roleFilter ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onRoleFilterChange(val ? (Number(val) as UserRole) : undefined);
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
              onIsActiveFilterChange(val === '' ? undefined : val === 'true');
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Đã khóa</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
