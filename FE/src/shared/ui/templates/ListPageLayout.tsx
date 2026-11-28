import { Group, Stack, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export interface ListPageLayoutProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
}

export function ListPageLayout({ title, actions, filters, tabs, children }: ListPageLayoutProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Title order={2} style={{ color: 'var(--mantine-primary-color-filled)' }}>
          {title}
        </Title>
        {(filters || actions) && (
          <Group gap="xs" wrap="wrap">
            {filters}
            {actions}
          </Group>
        )}
      </Group>

      {tabs}

      {children}
    </Stack>
  );
}
