import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Transition,
} from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import { ArrowRight, BarChart3, CheckCircle2, FileSpreadsheet, Landmark, Layers, MapPin, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/entities/session';
import { LoginDialog } from '@/features/auth';
import { APP_NAME, ROUTES } from '@/shared/config/constants';

const FEATURES = [
  {
    icon: Layers,
    title: 'Danh mục & Thửa đất',
    description: 'Quản lý cây 67 loại đất, 18 nhóm đối tượng sử dụng và thông tin thửa đất đồng bộ.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Kiểm kê định kỳ',
    description: 'Nhập và đối chiếu số liệu biểu B01, B02, B04, B05 nhanh chóng với sai số kiểm soát chặt chẽ.',
  },
  {
    icon: BarChart3,
    title: 'Báo cáo trực quan',
    description: 'Theo dõi cơ cấu sử dụng đất và biến động giữa các kỳ kiểm kê theo thời gian thực.',
  },
  {
    icon: ShieldCheck,
    title: 'Phân quyền & Bảo mật',
    description: 'Kiểm soát truy cập theo vai trò Quản trị viên, Cán bộ địa chính, Lãnh đạo và Người dân.',
  },
];

const STATS = [
  { label: 'Loại đất chuẩn hóa', value: '67+' },
  { label: 'Biểu mẫu kiểm kê', value: 'B01–B05' },
  { label: 'Độ chính xác', value: '0.005 ha' },
];

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken));
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>{APP_NAME} — Hệ thống quản lý đất đai cấp xã</title>
      </Helmet>

      <Box mih="100vh" bg="var(--mantine-color-body)">
        <Box
          component="header"
          pos="sticky"
          top={0}
          style={{
            zIndex: 30,
            borderBottom: '1px solid var(--mantine-color-default-border)',
            backgroundColor: 'var(--mantine-color-body)',
          }}
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

              {isAuthenticated ? (
                <Button component={Link} to={ROUTES.HOME} size="sm" rightSection={<ArrowRight size={16} />}>
                  Vào hệ thống
                </Button>
              ) : (
                <Button size="sm" rightSection={<ArrowRight size={16} />} onClick={() => setLoginOpen(true)}>
                  Đăng nhập
                </Button>
              )}
            </Group>
          </Container>
        </Box>

        <main>
          <Box
            component="section"
            py={{ base: 64, sm: 96 }}
            style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
          >
            <Container size="lg">
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={48} style={{ alignItems: 'center' }}>
                <Transition mounted={mounted} transition="fade-right" duration={reduceMotion ? 0 : 400}>
                  {(styles) => (
                    <Stack gap="lg" style={styles}>
                      <Box>
                        <Badge variant="light" size="lg">
                          Chuyển đổi số địa chính cấp xã
                        </Badge>
                      </Box>

                      <Title order={1} size={44} lh={1.15} fw={900}>
                        Quản lý đất đai{' '}
                        <Text span inherit c="green">
                          minh bạch &amp; chính xác
                        </Text>
                      </Title>

                      <Text size="lg" c="dimmed" lh={1.6} maw={520}>
                        Nền tảng số hóa công tác kiểm kê đất đai, quản lý hồ sơ địa chính và theo dõi biến động phục vụ
                        UBND cấp xã.
                      </Text>

                      <Group pt="xs">
                        {isAuthenticated ? (
                          <Button
                            component={Link}
                            to={ROUTES.HOME}
                            size="lg"
                            rightSection={<ArrowRight size={18} />}
                          >
                            Vào bảng điều khiển
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            rightSection={<ArrowRight size={18} />}
                            onClick={() => setLoginOpen(true)}
                          >
                            Đăng nhập ngay
                          </Button>
                        )}
                      </Group>

                      <SimpleGrid
                        cols={3}
                        pt="lg"
                        style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
                      >
                        {STATS.map((stat) => (
                          <Box key={stat.label}>
                            <Text size="xl" fw={900} c="green">
                              {stat.value}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {stat.label}
                            </Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Stack>
                  )}
                </Transition>

                <Transition mounted={mounted} transition="fade-up" duration={reduceMotion ? 0 : 450}>
                  {(styles) => (
                    <Box style={styles} maw={440} w="100%" mx="auto">
                      <Card withBorder shadow="xl" radius="md" padding="lg">
                        <Card.Section withBorder inheritPadding py="sm">
                          <Group justify="space-between" mb={4}>
                            <Group gap="xs">
                              <MapPin size={16} color="var(--mantine-color-green-6)" />
                              <Text size="sm" fw={700}>
                                Tổng quan Kỳ kiểm kê 2026
                              </Text>
                            </Group>
                            <Badge>Đang hoạt động</Badge>
                          </Group>
                          <Text size="xs" c="dimmed">
                            Số liệu đồng bộ toàn xã theo thời gian thực
                          </Text>
                        </Card.Section>

                        <Stack gap="md" pt="md">
                          <SimpleGrid cols={2} spacing="sm">
                            <Card withBorder padding="sm" radius="md" bg="var(--mantine-color-default-hover)">
                              <Text size="xs" c="dimmed">
                                Đất nông nghiệp
                              </Text>
                              <Text size="lg" fw={700} c="green" mt={4}>
                                1,245.80 ha
                              </Text>
                            </Card>
                            <Card withBorder padding="sm" radius="md" bg="var(--mantine-color-default-hover)">
                              <Text size="xs" c="dimmed">
                                Đất phi nông nghiệp
                              </Text>
                              <Text size="lg" fw={700} mt={4}>
                                412.35 ha
                              </Text>
                            </Card>
                          </SimpleGrid>

                          <Card withBorder padding="sm" radius="md">
                            <Group justify="space-between" mb="xs">
                              <Group gap={6}>
                                <CheckCircle2 size={14} color="var(--mantine-color-green-6)" />
                                <Text size="xs" c="dimmed">
                                  Đối chiếu biểu B01 – B05
                                </Text>
                              </Group>
                              <Text size="xs" fw={600} c="green">
                                Khớp 100%
                              </Text>
                            </Group>
                            <Progress value={100} size="sm" radius="xl" />
                          </Card>
                        </Stack>
                      </Card>
                    </Box>
                  )}
                </Transition>
              </SimpleGrid>
            </Container>
          </Box>

          <Container size="lg" py={{ base: 64, sm: 80 }}>
            <Stack align="center" gap={4} mb="xl" ta="center">
              <Title order={2} size="h2">
                Tính năng trọng tâm
              </Title>
              <Text size="sm" c="dimmed">
                Thiết kế tối ưu cho quy trình nghiệp vụ địa chính tại địa phương
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              {FEATURES.map((item) => (
                <Card key={item.title} withBorder shadow="sm" radius="md" padding="lg">
                  <Stack gap="sm">
                    <ThemeIcon size={40} radius="md" variant="light">
                      <item.icon size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="md">
                      {item.title}
                    </Text>
                    <Text size="sm" c="dimmed" lh={1.6}>
                      {item.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Container>
        </main>

        <Box
          component="footer"
          py="lg"
          ta="center"
          style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
        >
          <Text size="xs" c="dimmed">
            © {new Date().getFullYear()} {APP_NAME} — Hệ thống quản lý đất đai cấp xã
          </Text>
        </Box>
      </Box>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
