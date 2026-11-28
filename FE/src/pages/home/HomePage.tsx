import { Badge, Box, Button, Card, Container, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { KeyRound, Landmark, LogOut, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/entities/session';
import { ChangePasswordDialog, useLogout } from '@/features/auth';
import { USER_ROLE_LABELS } from '@/features/users';
import { APP_NAME } from '@/shared/config/constants';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const isAdmin = user?.role === 'Admin';
  const roleLabel =
    (user?.role && user.role in USER_ROLE_LABELS
      ? USER_ROLE_LABELS[user.role as keyof typeof USER_ROLE_LABELS]
      : user?.role) ?? '—';

  return (
    <>
      <Helmet>
        <title>Trang chủ - {APP_NAME}</title>
      </Helmet>

      <Box mih="100vh" bg="var(--mantine-color-default-hover)">
        <Box
          component="header"
          bg="var(--mantine-color-body)"
          style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
        >
          <Container size="lg" h={64}>
            <Group justify="space-between" h="100%">
              <Group gap="xs">
                <ThemeIcon size={36} radius="md">
                  <Landmark size={18} />
                </ThemeIcon>
                <Text size="lg" fw={700}>
                  {APP_NAME}
                </Text>
              </Group>

              <Group gap="xs">
                {isAdmin && (
                  <Button
                    component={Link}
                    to="/users"
                    variant="default"
                    size="sm"
                    leftSection={<Users size={16} />}
                  >
                    Quản lý người dùng
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<KeyRound size={16} />}
                  onClick={() => setChangePasswordOpen(true)}
                >
                  Đổi mật khẩu
                </Button>
                <Button variant="subtle" color="gray" size="sm" leftSection={<LogOut size={16} />} onClick={logout}>
                  Đăng xuất
                </Button>
              </Group>
            </Group>
          </Container>
        </Box>

        <Container size="lg" py="xl">
          <Stack gap="lg">
            <Card withBorder radius="md" padding="lg">
              <Group justify="space-between" align="flex-start" mb="xs">
                <Box>
                  <Title order={2} size="h3">
                    Xin chào, {user?.fullName}
                  </Title>
                  <Text size="sm" c="dimmed">
                    Hệ thống quản lý đất đai cấp xã
                  </Text>
                </Box>
                <Badge variant="light" size="lg">
                  {roleLabel}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Tài khoản đăng nhập:{' '}
                <Text span fw={600} c="var(--mantine-color-text)">
                  {user?.userName}
                </Text>
              </Text>
            </Card>

            {isAdmin && (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                <Card withBorder radius="md" padding="lg">
                  <Stack gap="sm" justify="space-between" h="100%">
                    <Box>
                      <Group gap="xs" mb="xs">
                        <Users size={18} color="var(--mantine-color-green-6)" />
                        <Text fw={700} size="md">
                          Quản lý người dùng
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Tạo tài khoản, phân quyền, khóa/mở khóa và đặt lại mật khẩu.
                      </Text>
                    </Box>
                    <Box>
                      <Button component={Link} to="/users" size="sm">
                        Mở danh sách
                      </Button>
                    </Box>
                  </Stack>
                </Card>

                <Card withBorder radius="md" padding="lg">
                  <Stack gap="sm" justify="space-between" h="100%">
                    <Box>
                      <Group gap="xs" mb="xs">
                        <MapPin size={18} color="var(--mantine-color-green-6)" />
                        <Text fw={700} size="md">
                          Địa giới hành chính
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Quản lý danh mục Tỉnh/Thành phố, Xã/Phường.
                      </Text>
                    </Box>
                    <Box>
                      <Button component={Link} to="/locations" size="sm">
                        Mở danh sách
                      </Button>
                    </Box>
                  </Stack>
                </Card>
              </SimpleGrid>
            )}
          </Stack>
        </Container>
      </Box>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </>
  );
}
