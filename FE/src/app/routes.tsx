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
const ForbiddenPage = lazy(() => import('@/pages/forbidden').then((m) => ({ default: m.ForbiddenPage })));

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
  component: LandTypesPage,
});

const landHolderTypesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/land-holder-types',
  component: LandHolderTypesPage,
});

const inventoryPeriodsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/inventory-periods',
  component: InventoryPeriodsPage,
});

const inventoryPeriodDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/inventory-periods/$periodId',
  component: InventoryPeriodDetailPage,
});

const parcelsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/parcels',
  component: ParcelsPage,
});

export const routeTree = rootRoute.addChildren([
  landingRoute,
  adminLayoutRoute.addChildren([
    homeRoute,
    parcelsRoute,
    landTypesRoute,
    landHolderTypesRoute,
    inventoryPeriodsRoute,
    inventoryPeriodDetailRoute,
    usersRoute,
    locationsRoute,
  ]),
]);
