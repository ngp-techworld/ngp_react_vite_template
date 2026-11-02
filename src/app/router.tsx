import { Navigate, type RouteObject } from 'react-router';
import { LoadingState } from '@/shared/ui';
import { RequireAuth } from './guards/RequireAuth';
import { RequireGuest } from './guards/RequireGuest';
import { AppLayout } from './layouts/AppLayout';
import { RouteErrorPage } from './pages/RouteErrorPage';
import { paths } from './paths';

/**
 * All routes of the app. Every page is lazy-loaded (its own JS chunk); guards and layouts are not.
 * App.tsx turns this into a browser router; tests turn it into a memory router.
 */
export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <LoadingState className="min-h-dvh" />,
    children: [
      { path: '/', element: <Navigate to={paths.home} replace /> },
      {
        element: <RequireGuest />,
        children: [
          {
            path: paths.login,
            lazy: async () => ({
              Component: (await import('@/features/auth/pages/LoginPage')).LoginPage,
            }),
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [],
          },
        ],
      },
      {
        path: '*',
        lazy: async () => ({
          Component: (await import('./pages/NotFoundPage')).NotFoundPage,
        }),
      },
    ],
  },
];
