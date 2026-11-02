import { http, HttpResponse } from 'msw';
import type { User } from '@/features/auth';
import { demoUser } from './fixtures';

export const testXsrfToken = 'test-xsrf-token';

/** Common API responses from the contract. Tests combine them with `server.use(...)`. */
export const handlers = {
  signedIn: (user: User = demoUser) =>
    http.get('/api/v1/auth/me', () => HttpResponse.json({ data: user })),

  guest: () =>
    http.get('/api/v1/auth/me', () =>
      HttpResponse.json({ message: 'Unauthenticated.', code: 'unauthenticated' }, { status: 401 }),
    ),

  /** Like Sanctum: answers 204 and sets the XSRF-TOKEN cookie. */
  csrfCookie: () =>
    http.get('/sanctum/csrf-cookie', () => {
      document.cookie = `XSRF-TOKEN=${testXsrfToken}; path=/`;
      return new HttpResponse(null, { status: 204 });
    }),
};
