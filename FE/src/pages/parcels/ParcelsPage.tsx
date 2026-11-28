import { Helmet } from 'react-helmet-async';
import { ParcelsList } from '@/features/parcels';
import { APP_NAME } from '@/shared/config/constants';

export function ParcelsPage() {
  return (
    <>
      <Helmet>
        <title>Thửa đất - {APP_NAME}</title>
      </Helmet>

      <ParcelsList />
    </>
  );
}
