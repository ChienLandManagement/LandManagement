import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from '@/app/routes';
import { ErrorPage } from '@/pages/error';
import { NotFoundPage } from '@/pages/not-found';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: ErrorPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
