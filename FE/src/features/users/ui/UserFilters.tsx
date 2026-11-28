import { Card, Grid, Select, Text, TextInput } from '@mantine/core';
import { Search } from 'lucide-react';
import { UserRole } from '@/shared/api/model';

interface UserFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  roleFilter: UserRole | undefined;
  onRoleFilterChange: (role: UserRole | undefined) => void;
  isActiveFilter: boolean | undefined;
  onIsActiveFilterChange: (isActive: boolean | undefined) => void;
}

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: String(UserRole.Admin), label: 'Quản trị viên' },
  { value: String(UserRole.LandOfficer), label: 'Cán bộ địa chính' },
  { value: String(UserRole.Leader), label: 'Lãnh đạo' },
  { value: String(UserRole.Citizen), label: 'Người dân' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Đã khóa' },
];

export function UserFilters({
  searchInput,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  isActiveFilter,
  onIsActiveFilterChange,
}: UserFiltersProps) {
  return (
    <Card withBorder radius="md" padding="md">
      <Text fw={600} size="sm" mb="sm">
        Bộ lọc &amp; Tìm kiếm
      </Text>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <TextInput
            placeholder="Tìm theo tên đăng nhập, họ tên, email..."
            leftSection={<Search size={16} />}
            value={searchInput}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Select
            aria-label="Lọc theo vai trò"
            data={ROLE_OPTIONS}
            value={roleFilter !== undefined ? String(roleFilter) : ''}
            onChange={(val) => onRoleFilterChange(val ? (Number(val) as UserRole) : undefined)}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Select
            aria-label="Lọc theo trạng thái"
            data={STATUS_OPTIONS}
            value={isActiveFilter === undefined ? '' : String(isActiveFilter)}
            onChange={(val) => onIsActiveFilterChange(val === '' || val === null ? undefined : val === 'true')}
            allowDeselect={false}
          />
        </Grid.Col>
      </Grid>
    </Card>
  );
}
