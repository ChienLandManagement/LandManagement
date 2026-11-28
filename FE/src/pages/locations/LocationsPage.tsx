import { Tabs } from '@mantine/core';
import { Helmet } from 'react-helmet-async';
import { ProvincesTab, WardsTab } from '@/features/locations';
import { APP_NAME } from '@/shared/config/constants';
import { ListPageLayout } from '@/shared/ui/templates';

export function LocationsPage() {
  return (
    <>
      <Helmet>
        <title>Địa giới hành chính - {APP_NAME}</title>
      </Helmet>

      <ListPageLayout
        title="Địa giới hành chính"
        description="Quản lý danh mục Tỉnh/Thành phố và Xã/Phường."
      >
        <Tabs defaultValue="provinces" keepMounted={false}>
          <Tabs.List mb="md">
            <Tabs.Tab value="provinces">Tỉnh/Thành phố</Tabs.Tab>
            <Tabs.Tab value="wards">Xã/Phường</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="provinces">
            <ProvincesTab />
          </Tabs.Panel>

          <Tabs.Panel value="wards">
            <WardsTab />
          </Tabs.Panel>
        </Tabs>
      </ListPageLayout>
    </>
  );
}
