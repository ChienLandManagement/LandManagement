import { Box, Button, Center, Group, Stack, Text, ThemeIcon, Title, Transition } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FileQuestion, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { APP_NAME, ROUTES } from '@/shared/config/constants';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>404 - {APP_NAME}</title>
      </Helmet>
      <Center mih="100vh" px="md">
        <Transition mounted={mounted} transition="fade-up" duration={reduceMotion ? 0 : 300} timingFunction="ease">
          {(styles) => (
            <Box style={styles} maw={420} w="100%" ta="center">
              <Stack align="center" gap="md">
                <ThemeIcon size={72} radius="xl" variant="light" color="gray">
                  <FileQuestion size={36} />
                </ThemeIcon>

                <Text size="sm" fw={700} tt="uppercase" c="dimmed" lts={1.5}>
                  Lỗi 404
                </Text>
                <Title order={1} size="h2">
                  Trang không tồn tại
                </Title>
                <Text size="sm" c="dimmed" lh={1.6}>
                  Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại địa chỉ.
                </Text>

                <Group justify="center" gap="sm" mt="md">
                  <Button variant="default" leftSection={<ArrowLeft size={16} />} onClick={() => window.history.back()}>
                    Quay lại
                  </Button>
                  <Button leftSection={<Home size={16} />} onClick={() => navigate({ to: ROUTES.HOME })}>
                    Về trang chủ
                  </Button>
                </Group>
              </Stack>
            </Box>
          )}
        </Transition>
      </Center>
    </>
  );
}
