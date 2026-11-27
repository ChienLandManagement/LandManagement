import { Suspense } from 'react';
import { Outlet, createRootRoute, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { NotFoundPage } from '@/pages/not-found';

const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));

const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}>
      <Outlet />
    </Suspense>
  ),
  notFoundComponent: NotFoundPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

export const routeTree = rootRoute.addChildren([loginRoute]);
