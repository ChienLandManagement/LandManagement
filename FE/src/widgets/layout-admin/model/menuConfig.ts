import {
  ClipboardList,
  FileCheck2,
  FolderTree,
  Home,
  Layers,
  type LucideIcon,
  Map as MapIcon,
  MapPin,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react';

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
  children?: MenuItem[];
}

// Người dân chưa có chức năng nghiệp vụ nên chỉ thấy Tổng quan.
const BUSINESS_ROLES = ['Admin', 'LandOfficer', 'Leader'];

export const MENU_CONFIG: MenuItem[] = [
  {
    path: '/home',
    label: 'Tổng quan',
    icon: Home,
  },
  {
    path: '/parcels',
    label: 'Thửa đất',
    icon: MapIcon,
    roles: BUSINESS_ROLES,
  },
  {
    path: '/dossiers',
    label: 'Hồ sơ GCN',
    icon: FileCheck2,
    roles: BUSINESS_ROLES,
  },
  {
    path: '/inventory-periods',
    label: 'Kiểm kê',
    icon: ClipboardList,
    roles: BUSINESS_ROLES,
  },
  {
    path: '#catalogs',
    label: 'Danh mục',
    icon: FolderTree,
    roles: BUSINESS_ROLES,
    children: [
      {
        path: '/land-types',
        label: 'Loại đất',
        icon: Layers,
      },
      {
        path: '/land-holder-types',
        label: 'Đối tượng đất',
        icon: UsersRound,
      },
    ],
  },
  {
    path: '#system',
    label: 'Quản trị hệ thống',
    icon: Settings,
    roles: ['Admin'],
    children: [
      {
        path: '/users',
        label: 'Quản lý người dùng',
        icon: Users,
        roles: ['Admin'],
      },
      {
        path: '/locations',
        label: 'Địa giới hành chính',
        icon: MapPin,
        roles: ['Admin'],
      },
    ],
  },
];
