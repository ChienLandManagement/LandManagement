import { Skeleton, Stack } from '@mantine/core';
import { createRootRoute, createRoute, lazyRouteComponent, Outlet, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getUser } from '@/entities/session';
import { NotFoundPage } from '@/pages/not-found';
import { LayoutAdmin } from '@/widgets/layout-admin';

const LandingPage = lazyRouteComponent(() => import('@/pages/landing'), 'LandingPage');
const HomePage = lazyRouteComponent(() => import('@/pages/home'), 'HomePage');
const UsersPage = lazy(() => import('@/pages/users').then((m) => ({ default: m.UsersPage })));
const LocationsPage = lazy(() => import('@/pages/locations').then((m) => ({ default: m.LocationsPage })));
const LandTypesPage = lazyRouteComponent(() => import('@/pages/land-types'), 'LandTypesPage');
const LandHolderTypesPage = lazyRouteComponent(() => import('@/pages/land-holder-types'), 'LandHolderTypesPage');
const InventoryPeriodsPage = lazyRouteComponent(() => import('@/pages/inventory-periods'), 'InventoryPeriodsPage');
const InventoryPeriodDetailPage = lazyRouteComponent(
  () => import('@/pages/inventory-period-detail'),
  'InventoryPeriodDetailPage',
);
const ParcelsPage = lazyRouteComponent(() => import('@/pages/parcels'), 'ParcelsPage');
const DossiersPage = lazyRouteComponent(() => import('@/pages/dossiers'), 'DossiersPage');
const ForbiddenPage = lazy(() => import('@/pages/forbidden').then((m) => ({ default: m.ForbiddenPage })));

// Vai trò xem được các trang nghiệp vụ. Người dân chưa có trang riêng nên chỉ thấy Tổng quan.
const BUSINESS_ROLES = ['Admin', 'LandOfficer', 'Leader'];

const requireBusinessRole = () => {
  const role = getUser()?.role;
  if (!role || !BUSINESS_ROLES.includes(role)) throw redirect({ to: '/home' });
};

const rootRoute = createRootRoute({
  component: () => (
    <Suspense
      fallback={
        <Stack p="md" gap="md">
          <Skeleton height={48} />
          <Skeleton height={320} />
        </Stack>
      }
    >
      <Outlet />
    </Suspense>
  ),
  notFoundComponent: NotFoundPage,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  beforeLoad: () => {
    if (!getUser()) throw redirect({ to: '/' });
  },
  component: LayoutAdmin,
});

const homeRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/home',
  component: HomePage,
});

const usersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/users',
  loader: () => import('@/pages/users'),
  component: () => {
    const user = getUser();
    if (user?.role !== 'Admin') return <ForbiddenPage />;
    return <UsersPage />;
  },
});

const locationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/locations',
  loader: () => import('@/pages/locations'),
  component: () => {
    const user = getUser();
    if (user?.role !== 'Admin') return <ForbiddenPage />;
    return <LocationsPage />;
  },
});

const landTypesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/land-types',
  beforeLoad: requireBusinessRole,
  component: LandTypesPage,
});

const landHolderTypesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/land-holder-types',
  beforeLoad: requireBusinessRole,
  component: LandHolderTypesPage,
});

const inventoryPeriodsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/inventory-periods',
  beforeLoad: requireBusinessRole,
  component: InventoryPeriodsPage,
});

const inventoryPeriodDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/inventory-periods/$periodId',
  beforeLoad: requireBusinessRole,
  component: InventoryPeriodDetailPage,
});

const parcelsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/parcels',
  beforeLoad: requireBusinessRole,
  component: ParcelsPage,
});

const dossiersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/dossiers',
  beforeLoad: requireBusinessRole,
  validateSearch: (search: Record<string, unknown>): { overdue?: true } =>
    search.overdue === true || search.overdue === 'true' ? { overdue: true } : {},
  component: DossiersPage,
});

export const routeTree = rootRoute.addChildren([
  landingRoute,
  adminLayoutRoute.addChildren([
    homeRoute,
    parcelsRoute,
    dossiersRoute,
    landTypesRoute,
    landHolderTypesRoute,
    inventoryPeriodsRoute,
    inventoryPeriodDetailRoute,
    usersRoute,
    locationsRoute,
  ]),
]);
