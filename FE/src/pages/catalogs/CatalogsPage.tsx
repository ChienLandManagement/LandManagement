import { Tabs } from '@mantine/core';
import { Helmet } from 'react-helmet-async';
import { LandHolderTypesTab, LandTypesTab } from '@/features/catalogs';
import { APP_NAME } from '@/shared/config/constants';
import { ListPageLayout } from '@/shared/ui/templates';

export function CatalogsPage() {
  return (
    <>
      <Helmet>
        <title>Danh mục - {APP_NAME}</title>
      </Helmet>

      <ListPageLayout
        title="Danh mục"
        description="Danh mục chuẩn theo Thông tư 08/2024: Loại đất và Đối tượng sử dụng/quản lý đất."
      >
        <Tabs defaultValue="land-types" keepMounted={false}>
          <Tabs.List mb="md">
            <Tabs.Tab value="land-types">Loại đất</Tabs.Tab>
            <Tabs.Tab value="land-holder-types">Đối tượng sử dụng/quản lý đất</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="land-types">
            <LandTypesTab />
          </Tabs.Panel>

          <Tabs.Panel value="land-holder-types">
            <LandHolderTypesTab />
          </Tabs.Panel>
        </Tabs>
      </ListPageLayout>
    </>
  );
}
