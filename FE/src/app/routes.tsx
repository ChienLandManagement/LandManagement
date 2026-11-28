import { Suspense } from 'react';
import { Outlet, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { getUser } from '@/entities/session';
import { lazy } from 'react';
import { NotFoundPage } from '@/pages/not-found';

const LandingPage = lazy(() => import('@/pages/landing').then((m) => ({ default: m.LandingPage })));

const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));

const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })));

const UsersPage = lazy(() => import('@/pages/users').then((m) => ({ default: m.UsersPage })));

const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}>
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

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  beforeLoad: () => {
    if (!getUser()) throw redirect({ to: '/login' });
  },
  component: HomePage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  beforeLoad: () => {
    const user = getUser();
    if (!user) throw redirect({ to: '/login' });
    if (user.role !== 'Admin') throw redirect({ to: '/home' });
  },
  component: UsersPage,
});

export const routeTree = rootRoute.addChildren([landingRoute, loginRoute, homeRoute, usersRoute]);
