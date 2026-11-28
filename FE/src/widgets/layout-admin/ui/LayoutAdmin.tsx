import { useState } from 'react';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Breadcrumbs,
  Burger,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LogOut,
  Map as MapIcon,
  Moon,
  Palette,
  Sun,
} from 'lucide-react';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { getUser } from '@/entities/session';
import { ChangePasswordDialog, useLogout } from '@/features/auth';
import { MENU_CONFIG } from '../model/menuConfig';
import { UiSettingsDrawer } from './UiSettingsDrawer';

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

export function LayoutAdmin() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const user = getUser();
  const logout = useLogout();

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const visibleMenu = MENU_CONFIG.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  const currentItem = MENU_CONFIG.find((item) => pathname.startsWith(item.path));

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: collapsed ? 72 : 250,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group gap="sm">
              <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={toggleCollapsed}
                visibleFrom="sm"
                aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
              >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </ActionIcon>
              <Breadcrumbs>
                <Text size="sm" c="dimmed">
                  Hệ thống
                </Text>
                {currentItem && (
                  <Text size="sm" fw={500}>
                    {currentItem.label}
                  </Text>
                )}
              </Breadcrumbs>
            </Group>

            <Group gap="sm">
              <Tooltip label="Tùy chỉnh giao diện">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={openSettings}
                  aria-label="Tùy chỉnh giao diện"
                >
                  <Palette size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={computedColorScheme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={() => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')}
                  aria-label="Đổi giao diện sáng/tối"
                >
                  {computedColorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </ActionIcon>
              </Tooltip>

              <Menu shadow="md" width={220} position="bottom-end">
                <Menu.Target>
                  <Group gap="xs" style={{ cursor: 'pointer' }}>
                    <Avatar color="teal" radius="xl" size="sm">
                      {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                    </Avatar>
                    <Stack gap={0} visibleFrom="xs">
                      <Text size="sm" fw={500} lh={1.2}>
                        {user?.fullName ?? 'Người dùng'}
                      </Text>
                      <Text size="xs" c="dimmed" lh={1.2}>
                        {user?.role ?? ''}
                      </Text>
                    </Stack>
                  </Group>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Tài khoản</Menu.Label>
                  <Menu.Item
                    leftSection={<KeyRound size={14} />}
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    Đổi mật khẩu
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<LogOut size={14} />}
                    onClick={() => void logout()}
                  >
                    Đăng xuất
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="sm">
          <Group gap="xs" px="xs" py="sm" mb="sm" wrap="nowrap">
            <MapIcon size={24} color="var(--mantine-color-teal-6)" style={{ flexShrink: 0 }} />
            {!collapsed && (
              <Text fw={700} size="md" truncate>
                Quản lý đất đai
              </Text>
            )}
          </Group>

          <Stack gap={4}>
            {visibleMenu.map((item) => {
              const Icon = item.icon;
              const visibleChildren = item.children?.filter(
                (child) => !child.roles || (user?.role && child.roles.includes(user.role)),
              );

              if (visibleChildren && visibleChildren.length > 0) {
                const hasActiveChild = visibleChildren.some(
                  (child) => pathname === child.path || pathname.startsWith(`${child.path}/`),
                );

                const groupNav = (
                  <NavLink
                    key={item.path}
                    label={collapsed ? undefined : item.label}
                    leftSection={<Icon size={18} strokeWidth={1.7} />}
                    defaultOpened={hasActiveChild}
                    childrenOffset={collapsed ? 0 : 24}
                    style={{ borderRadius: 'var(--mantine-radius-md)' }}
                  >
                    {!collapsed &&
                      visibleChildren.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname === child.path || pathname.startsWith(`${child.path}/`);
                        return (
                          <NavLink
                            key={child.path}
                            component={Link}
                            to={child.path}
                            label={child.label}
                            leftSection={<ChildIcon size={16} strokeWidth={1.7} />}
                            active={childActive}
                            onClick={closeMobile}
                            style={{ borderRadius: 'var(--mantine-radius-md)' }}
                          />
                        );
                      })}
                  </NavLink>
                );

                return collapsed ? (
                  <Tooltip key={item.path} label={item.label} position="right" withArrow>
                    {groupNav}
                  </Tooltip>
                ) : (
                  groupNav
                );
              }

              const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
              const navLink = (
                <NavLink
                  key={item.path}
                  component={Link}
                  to={item.path}
                  label={collapsed ? undefined : item.label}
                  leftSection={<Icon size={18} strokeWidth={1.7} />}
                  active={active}
                  onClick={closeMobile}
                  style={{ borderRadius: 'var(--mantine-radius-md)' }}
                />
              );

              return collapsed ? (
                <Tooltip key={item.path} label={item.label} position="right" withArrow>
                  {navLink}
                </Tooltip>
              ) : (
                navLink
              );
            })}
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      <UiSettingsDrawer opened={settingsOpened} onClose={closeSettings} />
    </>
  );
}
