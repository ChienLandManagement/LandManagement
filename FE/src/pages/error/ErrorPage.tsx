import { Box, Button, Center, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Home, RefreshCw, TriangleAlert } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { APP_NAME, ROUTES } from '@/shared/config/constants';

/** Trang lỗi chung của router: lỗi không lường trước hoặc tải file trang thất bại (thường do vừa có bản mới). */
export default function ErrorPage() {
  return (
    <>
      <Helmet>
        <title>Có lỗi xảy ra - {APP_NAME}</title>
      </Helmet>
      <Center mih="100vh" px="md">
        <Box maw={420} w="100%" ta="center">
          <Stack align="center" gap="md">
            <ThemeIcon size={72} radius="xl" variant="light" color="red">
              <TriangleAlert size={36} />
            </ThemeIcon>
            <Title order={1} size="h2">
              Có lỗi xảy ra
            </Title>
            <Text size="sm" c="dimmed" lh={1.6}>
              Trang không tải được. Có thể hệ thống vừa được cập nhật hoặc đường truyền bị gián đoạn. Hãy tải lại trang
              để thử lại.
            </Text>
            <Group justify="center" gap="sm" mt="md">
              <Button variant="default" leftSection={<Home size={16} />} component="a" href={ROUTES.HOME}>
                Về trang chủ
              </Button>
              <Button leftSection={<RefreshCw size={16} />} onClick={() => window.location.reload()}>
                Tải lại trang
              </Button>
            </Group>
          </Stack>
        </Box>
      </Center>
    </>
  );
}
