import { Badge, Box, Button, Card, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { MapPin, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/entities/session';
import { USER_ROLE_LABELS } from '@/features/users';
import { APP_NAME } from '@/shared/config/constants';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

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

      <Container size="lg" py="md">
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
    </>
  );
}
