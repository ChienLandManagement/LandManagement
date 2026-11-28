import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from '@/app/routes';
import { NotFoundPage } from '@/pages/not-found';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
