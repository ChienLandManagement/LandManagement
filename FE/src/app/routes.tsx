import { Center, Loader } from '@mantine/core';
import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getUser } from '@/entities/session';
import { NotFoundPage } from '@/pages/not-found';
import { LayoutAdmin } from '@/widgets/layout-admin';

const LandingPage = lazy(() => import('@/pages/landing').then((m) => ({ default: m.LandingPage })));
const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })));
const UsersPage = lazy(() => import('@/pages/users').then((m) => ({ default: m.UsersPage })));
const LocationsPage = lazy(() => import('@/pages/locations').then((m) => ({ default: m.LocationsPage })));
const LandTypesPage = lazy(() => import('@/pages/land-types').then((m) => ({ default: m.LandTypesPage })));
const LandHolderTypesPage = lazy(() =>
  import('@/pages/land-holder-types').then((m) => ({ default: m.LandHolderTypesPage })),
);
const InventoryPeriodsPage = lazy(() =>
  import('@/pages/inventory-periods').then((m) => ({ default: m.InventoryPeriodsPage })),
);
const InventoryPeriodDetailPage = lazy(() =>
  import('@/pages/inventory-period-detail').then((m) => ({ default: m.InventoryPeriodDetailPage })),
);
const ForbiddenPage = lazy(() => import('@/pages/forbidden').then((m) => ({ default: m.ForbiddenPage })));

const rootRoute = createRootRoute({
  component: () => (
    <Suspense
      fallback={
        <Center mih="100vh">
          <Loader />
        </Center>
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
  component: () => {
    const user = getUser();
    if (user?.role !== 'Admin') return <ForbiddenPage />;
    return <UsersPage />;
  },
});

const locationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/locations',
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

export const routeTree = rootRoute.addChildren([
  landingRoute,
  adminLayoutRoute.addChildren([
    homeRoute,
    landTypesRoute,
    landHolderTypesRoute,
    inventoryPeriodsRoute,
    inventoryPeriodDetailRoute,
    usersRoute,
    locationsRoute,
  ]),
]);
