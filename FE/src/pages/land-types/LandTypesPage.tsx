import { Helmet } from 'react-helmet-async';
import { LandTypesTab } from '@/features/catalogs';
import { APP_NAME } from '@/shared/config/constants';

export function LandTypesPage() {
  return (
    <>
      <Helmet>
        <title>Loại đất - {APP_NAME}</title>
      </Helmet>

      <LandTypesTab />
    </>
  );
}
