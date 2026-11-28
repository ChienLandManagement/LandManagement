import { FolderTree, Home, Layers, type LucideIcon, MapPin, Settings, Users, UsersRound } from 'lucide-react';

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
