import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

type AppProvidersProps = {
  queryClient: QueryClient;
  children: ReactNode;
};

/** App-wide providers. Tests render the same providers with their own QueryClient. */
export function AppProviders({ queryClient, children }: AppProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
