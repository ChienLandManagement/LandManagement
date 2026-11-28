import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export interface ListPageLayoutProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}

export function ListPageLayout({ title, description, actions, filters, children }: ListPageLayoutProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <Stack gap={4}>
          <Title order={2} style={{ color: 'var(--mantine-primary-color-filled)' }}>
            {title}
          </Title>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
        {actions && <Group gap="xs">{actions}</Group>}
      </Group>

      {filters && (
        <Paper withBorder p="md" radius="md">
          {filters}
        </Paper>
      )}

      {children}
    </Stack>
  );
}
