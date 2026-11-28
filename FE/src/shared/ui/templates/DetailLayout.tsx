import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export interface DetailLayoutProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}

export function DetailLayout({ title, subtitle, actions, aside, children }: DetailLayoutProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <Stack gap={4}>
          <Title order={2}>{title}</Title>
          {subtitle && (
            <Text size="sm" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Stack>
        {actions && <Group gap="xs">{actions}</Group>}
      </Group>

      <Group align="flex-start" gap="md" wrap="wrap">
        <Paper withBorder p="lg" radius="md" style={{ flex: 1, minWidth: 280 }}>
          <Stack gap="md">{children}</Stack>
        </Paper>
        {aside && (
          <Paper withBorder p="lg" radius="md" w={{ base: '100%', md: 320 }}>
            <Stack gap="md">{aside}</Stack>
          </Paper>
        )}
      </Group>
    </Stack>
  );
}
