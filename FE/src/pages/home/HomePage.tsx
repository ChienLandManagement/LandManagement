import { Alert, Container } from '@mantine/core';
import { Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getUser } from '@/entities/session';
import { DashboardView } from '@/features/dashboard';
import { APP_NAME } from '@/shared/config/constants';

export default function HomePage() {
  const isCitizen = getUser()?.role === 'Citizen';

  return (
    <>
      <Helmet>
        <title>Tổng quan - {APP_NAME}</title>
      </Helmet>

      <Container size="xl" py="md">
        {isCitizen ? (
          <Alert icon={<Info size={18} />} title="Tài khoản người dân" color="blue" variant="light">
            Chức năng tra cứu tiến độ hồ sơ cho người dân sẽ được mở ở giai đoạn sau.
          </Alert>
        ) : (
          <DashboardView />
        )}
      </Container>
    </>
  );
}
