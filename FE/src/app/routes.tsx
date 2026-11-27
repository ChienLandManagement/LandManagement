import { Suspense } from 'react';
import { Outlet, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { getUser } from '@/entities/session';
import { lazy } from 'react';
import { NotFoundPage } from '@/pages/not-found';

const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));

const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })));

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

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  beforeLoad: () => {
    if (!getUser()) throw redirect({ to: '/login' });
  },
  component: HomePage,
});

export const routeTree = rootRoute.addChildren([loginRoute, homeRoute]);
