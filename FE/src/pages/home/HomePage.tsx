import { Container } from '@mantine/core';
import { Helmet } from 'react-helmet-async';
import { DashboardView } from '@/features/dashboard';
import { APP_NAME } from '@/shared/config/constants';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Tổng quan - {APP_NAME}</title>
      </Helmet>

      <Container size="xl" py="md">
        <DashboardView />
      </Container>
    </>
  );
}
