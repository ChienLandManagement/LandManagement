import { Home, MapPin, Users, type LucideIcon } from 'lucide-react';

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
}

export const MENU_CONFIG: MenuItem[] = [
  {
    path: '/home',
    label: 'Tổng quan',
    icon: Home,
  },
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
];
