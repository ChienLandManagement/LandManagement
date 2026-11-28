import { zodResolver } from '@hookform/resolvers/zod';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Center,
  Flex,
  Group,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft, Landmark, Lock, MapPin, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { setAuth } from '@/entities/session';
import { loginApi } from '@/features/auth';
import { APP_NAME, ROUTES } from '@/shared/config/constants';

const schema = z.object({
  userName: z.string().trim().min(1, 'Nhập tên đăng nhập'),
  password: z.string().min(1, 'Nhập mật khẩu'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { userName: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const { user, accessToken } = await loginApi(values);
      setAuth(user, accessToken);
      navigate({ to: ROUTES.HOME });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đăng nhập thất bại');
    }
  };

  return (
    <>
      <Helmet>
        <title>Đăng nhập - {APP_NAME}</title>
      </Helmet>
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={0} mih="100vh">
        <Box
          visibleFrom="lg"
          pos="relative"
          style={{
            background: 'linear-gradient(135deg, var(--mantine-color-green-8), var(--mantine-color-green-6))',
            color: 'var(--mantine-color-white)',
          }}
          p={64}
        >
          <Flex direction="column" justify="space-between" h="100%">
            <Box>
              <Group gap="sm" mb={48}>
                <ThemeIcon size={48} radius="md" color="white" variant="light">
                  <Landmark size={24} />
                </ThemeIcon>
                <Title order={1} size="h2" fw={900} c="white">
                  {APP_NAME}
                </Title>
              </Group>

              <Title order={2} size={40} lh={1.15} fw={800} c="white" mb="xl">
                Quản lý đất đai <br />
                <Text span inherit fw={500} fs="italic" opacity={0.85}>
                  minh bạch và đồng bộ.
                </Text>
              </Title>

              <Stack gap="lg" maw={420}>
                <Group align="flex-start" gap="md" wrap="nowrap">
                  <ThemeIcon size={42} radius="md" color="white" variant="light">
                    <MapPin size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700} size="lg" c="white" mb={4}>
                      Kiểm kê &amp; hồ sơ địa chính
                    </Text>
                    <Text size="sm" c="white" opacity={0.8} lh={1.6}>
                      Theo dõi biến động, danh mục loại đất và số liệu kiểm kê định kỳ cấp xã.
                    </Text>
                  </Box>
                </Group>

                <Group align="flex-start" gap="md" wrap="nowrap">
                  <ThemeIcon size={42} radius="md" color="white" variant="light">
                    <ShieldCheck size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700} size="lg" c="white" mb={4}>
                      Phân quyền chặt chẽ
                    </Text>
                    <Text size="sm" c="white" opacity={0.8} lh={1.6}>
                      Kiểm soát truy cập theo vai trò cán bộ địa chính, lãnh đạo và quản trị viên.
                    </Text>
                  </Box>
                </Group>
              </Stack>
            </Box>

            <Box pt="md" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <Text size="sm" c="white" opacity={0.7}>
                © {new Date().getFullYear()} {APP_NAME} — Hệ thống quản lý đất đai cấp xã
              </Text>
            </Box>
          </Flex>
        </Box>

        <Center px="md" py="xl" bg="var(--mantine-color-body)">
          <Box w="100%" maw={420}>
            <Group justify="center" gap="sm" mb="xl" hiddenFrom="lg">
              <ThemeIcon size={40} radius="md">
                <Landmark size={20} />
              </ThemeIcon>
              <Text size="xl" fw={900}>
                {APP_NAME}
              </Text>
            </Group>

            <Paper withBorder shadow="md" p="xl" radius="md">
              <Stack gap={4} mb="lg">
                <Group justify="space-between" align="center">
                  <Title order={2} size="h3">
                    Chào mừng trở lại!
                  </Title>
                  <ActionIcon
                    component={Link}
                    to="/"
                    variant="subtle"
                    color="gray"
                    aria-label="Về trang chủ"
                    title="Về trang chủ"
                  >
                    <ArrowLeft size={16} />
                  </ActionIcon>
                </Group>
                <Text size="sm" c="dimmed">
                  Đăng nhập để tiếp tục làm việc
                </Text>
              </Stack>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack gap="md">
                  <Controller
                    name="userName"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        label="Tên đăng nhập"
                        placeholder="Tên đăng nhập"
                        autoComplete="username"
                        autoFocus
                        leftSection={<User size={16} />}
                        error={errors.userName?.message}
                        size="md"
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <PasswordInput
                        {...field}
                        label="Mật khẩu"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        leftSection={<Lock size={16} />}
                        error={errors.password?.message}
                        size="md"
                      />
                    )}
                  />

                  {error && (
                    <Alert color="red" variant="light" icon={<AlertCircle size={16} />}>
                      {error}
                    </Alert>
                  )}

                  <Button type="submit" fullWidth size="md" loading={isSubmitting} mt="xs">
                    {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Box>
        </Center>
      </SimpleGrid>
    </>
  );
}
