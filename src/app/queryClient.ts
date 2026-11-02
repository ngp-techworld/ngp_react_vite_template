import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { clearSession } from '@/features/auth';
import { ApiError } from '@/shared/api';

/** 4xx answers (401, 403, 404, 422...) won't change on retry; network and 5xx errors get 2 more tries. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: { retry: shouldRetry, staleTime: 30_000 },
      mutations: { retry: false },
    },
  });

  function handleError(error: unknown): void {
    // The session expired or was revoked: forget it; the route guard redirects to /login.
    if (error instanceof ApiError && error.status === 401) {
      clearSession(queryClient);
    }
  }

  return queryClient;
}
