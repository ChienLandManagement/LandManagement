import { Suspense, lazy } from 'react';
import { Outlet, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { Center, Loader } from '@mantine/core';
import { getUser } from '@/entities/session';
import { NotFoundPage } from '@/pages/not-found';
import { LayoutAdmin } from '@/widgets/layout-admin';

const LandingPage = lazy(() => import('@/pages/landing').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));
const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })));
const UsersPage = lazy(() => import('@/pages/users').then((m) => ({ default: m.UsersPage })));
const LocationsPage = lazy(() =>
  import('@/pages/locations').then((m) => ({ default: m.LocationsPage })),
);
const ForbiddenPage = lazy(() =>
  import('@/pages/forbidden').then((m) => ({ default: m.ForbiddenPage })),
);

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

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  beforeLoad: () => {
    if (!getUser()) throw redirect({ to: '/login' });
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

export const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  adminLayoutRoute.addChildren([homeRoute, usersRoute, locationsRoute]),
]);
