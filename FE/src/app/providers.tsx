import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.css';

import { createTheme, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'dayjs/locale/vi';
import { type ReactNode, useMemo, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useUiSettingsStore } from '@/shared/model/uiSettingsStore';
import { theme as baseTheme } from './theme';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const primaryColor = useUiSettingsStore((s) => s.primaryColor);
  const defaultRadius = useUiSettingsStore((s) => s.defaultRadius);
  const theme = useMemo(
    () => createTheme({ ...baseTheme, primaryColor, defaultRadius }),
    [primaryColor, defaultRadius],
  );

  return (
    <HelmetProvider>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <DatesProvider settings={{ locale: 'vi', firstDayOfWeek: 1 }}>
          <Notifications position="bottom-right" />
          <ModalsProvider>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </ModalsProvider>
        </DatesProvider>
      </MantineProvider>
    </HelmetProvider>
  );
}
