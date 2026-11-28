import {
  ClipboardList,
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
  },
  {
    path: '#catalogs',
    label: 'Danh mục',
    icon: FolderTree,
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
    path: '/inventory-periods',
    label: 'Kiểm kê',
    icon: ClipboardList,
    roles: ['Admin', 'LandOfficer', 'Leader'],
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
