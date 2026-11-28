import { Group, Select } from '@mantine/core';
import { UserRole } from '@/shared/api/model';
import { AdminSearch } from '@/shared/ui/templates';

interface UserFiltersProps {
  keyword: string;
  onSearch: (value: string) => void;
  roleFilter: UserRole | undefined;
  onRoleFilterChange: (role: UserRole | undefined) => void;
  isActiveFilter: boolean | undefined;
  onIsActiveFilterChange: (isActive: boolean | undefined) => void;
}

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: UserRole.Admin, label: 'Quản trị viên' },
  { value: UserRole.LandOfficer, label: 'Cán bộ địa chính' },
  { value: UserRole.Leader, label: 'Lãnh đạo' },
  { value: UserRole.Citizen, label: 'Người dân' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Đã khóa' },
];

export function UserFilters({
  keyword,
  onSearch,
  roleFilter,
  onRoleFilterChange,
  isActiveFilter,
  onIsActiveFilterChange,
}: UserFiltersProps) {
  return (
    <Group gap="xs" wrap="wrap">
      <AdminSearch
        testId="users"
        placeholder="Tìm theo tên đăng nhập, họ tên, email..."
        value={keyword}
        onSearch={onSearch}
      />

      <Select
        aria-label="Lọc theo vai trò"
        data={ROLE_OPTIONS}
        value={roleFilter ?? ''}
        onChange={(val) => onRoleFilterChange(val ? (val as UserRole) : undefined)}
        allowDeselect={false}
        w={160}
      />

      <Select
        aria-label="Lọc theo trạng thái"
        data={STATUS_OPTIONS}
        value={isActiveFilter === undefined ? '' : String(isActiveFilter)}
        onChange={(val) => onIsActiveFilterChange(val === '' || val === null ? undefined : val === 'true')}
        allowDeselect={false}
        w={150}
      />
    </Group>
  );
}
