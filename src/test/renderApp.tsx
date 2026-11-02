import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProviders } from '@/app/providers';
import { createQueryClient } from '@/app/queryClient';
import { routes } from '@/app/router';

/**
 * Renders the real app (routes, guards, lazy pages, providers) at `path`, with the API mocked by
 * MSW. Use it to test what a user sees, the way they get there.
 */
export function renderApp(path: string) {
  const queryClient = createQueryClient();
  // Retries would only slow error tests down (they wait with backoff).
  queryClient.setDefaultOptions({
    ...queryClient.getDefaultOptions(),
    queries: { ...queryClient.getDefaultOptions().queries, retry: false },
  });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const user = userEvent.setup();

  render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  );

  return { router, queryClient, user };
}
