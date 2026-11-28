import { getRouteApi } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';
import { DossierList } from '@/features/dossiers';
import { APP_NAME } from '@/shared/config/constants';

const routeApi = getRouteApi('/admin-layout/dossiers');

export function DossiersPage() {
  const { overdue } = routeApi.useSearch();

  return (
    <>
      <Helmet>
        <title>Hồ sơ cấp GCN - {APP_NAME}</title>
      </Helmet>

      {/* key: đổi bộ lọc từ liên kết cảnh báo thì dựng lại danh sách */}
      <DossierList key={String(Boolean(overdue))} initialOverdue={Boolean(overdue)} />
    </>
  );
}
