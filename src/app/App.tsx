import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProviders } from './providers';
import { createQueryClient } from './queryClient';
import { routes } from './router';

// Created once, outside React, as React Router and TanStack Query recommend.
const queryClient = createQueryClient();
const router = createBrowserRouter(routes);

export function App() {
  return (
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
