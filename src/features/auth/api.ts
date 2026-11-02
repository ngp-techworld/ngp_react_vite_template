import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api, ApiError, fetchCsrfCookie, type Resource } from '@/shared/api';
import type { LoginInput } from './schemas';
import type { User } from './types';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

/** The signed-in user, or `null` for a guest. A 401 here is an answer, not an error. */
async function fetchMe(): Promise<User | null> {
  try {
    const response = await api.get<Resource<User>>('/auth/me');
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchMe,
    staleTime: 5 * 60_000,
  });
}

/**
 * Forgets the session on the client. The route guards react to `me === null` and send the user
 * to /login, so callers don't navigate themselves.
 */
export function clearSession(queryClient: QueryClient): void {
  queryClient.setQueryData(authKeys.me(), null);
  // Drop every other cached response so the next user never sees the previous user's data.
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.all[0] });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      // Sanctum SPA auth: get the XSRF-TOKEN cookie first; the client sends it back as a header.
      await fetchCsrfCookie();
      const response = await api.post<Resource<User>>('/auth/login', input);
      return response.data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<void>('/auth/logout'),
    onSuccess: () => clearSession(queryClient),
  });
}
