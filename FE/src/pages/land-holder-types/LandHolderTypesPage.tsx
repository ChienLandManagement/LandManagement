import { Helmet } from 'react-helmet-async';
import { LandHolderTypesTab } from '@/features/catalogs';
import { APP_NAME } from '@/shared/config/constants';

export function LandHolderTypesPage() {
  return (
    <>
      <Helmet>
        <title>Đối tượng đất - {APP_NAME}</title>
      </Helmet>

      <LandHolderTypesTab />
    </>
  );
}
