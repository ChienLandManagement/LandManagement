import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export interface FormLayoutProps {
  title: ReactNode;
  description?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  maxWidth?: number | string;
}

export function FormLayout({ title, description, headerActions, footer, children, maxWidth = 840 }: FormLayoutProps) {
  return (
    <Stack gap="md" maw={maxWidth} w="100%">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <Stack gap={4}>
          <Title order={2}>{title}</Title>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
        {headerActions && <Group gap="xs">{headerActions}</Group>}
      </Group>

      <Paper withBorder p="lg" radius="md">
        <Stack gap="md">
          {children}
          {footer && (
            <Group justify="flex-end" pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
              {footer}
            </Group>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
