import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { i18n } from '@/shared/i18n';
import ar from '@/shared/i18n/locales/ar.json';
import { handlers, testXsrfToken } from '@/test/handlers';
import { server } from '@/test/server';
import { api, ApiError } from './client';

/** Runs `request` and returns the ApiError it rejects with. */
async function captureApiError(request: () => Promise<unknown>): Promise<ApiError> {
  const error = await request().then(
    () => undefined,
    (reason: unknown) => reason,
  );
  if (!(error instanceof ApiError)) {
    throw new Error(`Expected an ApiError, got ${String(error)}`);
  }
  return error;
}

describe('api client', () => {
  it('prefixes /api/v1 and sends JSON, language, cookies and the query string', async () => {
    let captured: Request | undefined;
    server.use(
      http.get('/api/v1/items', ({ request }) => {
        captured = request;
        return HttpResponse.json({ data: [] });
      }),
    );
    // MSW rebuilds the Request without `credentials`, so check what the client passed to fetch.
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await api.get('/items', { query: { page: 2, search: '', per_page: undefined } });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(captured?.headers.get('Accept')).toBe('application/json');
    expect(captured?.headers.get('Accept-Language')).toBe('ar');
    expect(new URL(captured?.url ?? '').pathname).toBe('/api/v1/items');
    expect(new URL(captured?.url ?? '').search).toBe('?page=2');
  });

  it('follows the active language in Accept-Language', async () => {
    let language: string | null = null;
    server.use(
      http.get('/api/v1/items', ({ request }) => {
        language = request.headers.get('Accept-Language');
        return HttpResponse.json({ data: [] });
      }),
    );

    await i18n.changeLanguage('en');
    await api.get('/items');

    expect(language).toBe('en');
  });

  it('sends the XSRF-TOKEN cookie as X-XSRF-TOKEN on writes only', async () => {
    document.cookie = 'XSRF-TOKEN=abc%3D%3D; path=/';
    const xsrfHeaders: Record<string, string | null> = {};
    server.use(
      http.get('/api/v1/items', ({ request }) => {
        xsrfHeaders.get = request.headers.get('X-XSRF-TOKEN');
        return HttpResponse.json({ data: [] });
      }),
      http.post('/api/v1/items', async ({ request }) => {
        xsrfHeaders.post = request.headers.get('X-XSRF-TOKEN');
        expect(request.headers.get('Content-Type')).toBe('application/json');
        expect(await request.json()).toEqual({ name: 'New' });
        return HttpResponse.json({ data: { id: '1' } }, { status: 201 });
      }),
    );

    await api.get('/items');
    await api.post('/items', { name: 'New' });

    expect(xsrfHeaders).toEqual({ get: null, post: 'abc==' });
  });

  it('maps a 422 to ApiError with field errors', async () => {
    server.use(
      http.post('/api/v1/auth/login', () =>
        HttpResponse.json(
          {
            message: 'بيانات الدخول غير صحيحة.',
            code: 'invalid_credentials',
            errors: { email: ['بيانات الدخول غير صحيحة.'] },
          },
          { status: 422 },
        ),
      ),
    );

    const error = await captureApiError(() => api.post('/auth/login', {}));

    expect(error).toMatchObject({
      status: 422,
      code: 'invalid_credentials',
      message: 'بيانات الدخول غير صحيحة.',
      errors: { email: ['بيانات الدخول غير صحيحة.'] },
    });
  });

  it('maps a 401 without field errors', async () => {
    server.use(handlers.guest());

    const error = await captureApiError(() => api.get('/auth/me'));

    expect(error).toMatchObject({ status: 401, code: 'unauthenticated', errors: {} });
  });

  it('uses a translated generic message when the error body is not JSON', async () => {
    server.use(
      http.get('/api/v1/items', () => new HttpResponse('<h1>Bad Gateway</h1>', { status: 502 })),
    );

    const error = await captureApiError(() => api.get('/items'));

    expect(error).toMatchObject({ status: 502, code: 'server_error', message: ar.errors.generic });
  });

  it('maps a network failure to status 0', async () => {
    server.use(http.get('/api/v1/items', () => HttpResponse.error()));

    const error = await captureApiError(() => api.get('/items'));

    expect(error).toMatchObject({ status: 0, code: 'network_error', message: ar.errors.network });
  });

  it('returns undefined for 204 No Content', async () => {
    server.use(http.post('/api/v1/auth/logout', () => new HttpResponse(null, { status: 204 })));

    await expect(api.post('/auth/logout')).resolves.toBeUndefined();
  });

  it('refreshes the CSRF cookie and retries once after a 419', async () => {
    let attempts = 0;
    server.use(
      handlers.csrfCookie(),
      http.post('/api/v1/items', ({ request }) => {
        attempts += 1;
        if (request.headers.get('X-XSRF-TOKEN') !== testXsrfToken) {
          return HttpResponse.json({ message: 'CSRF token mismatch.' }, { status: 419 });
        }
        return HttpResponse.json({ data: { id: '1' } }, { status: 201 });
      }),
    );

    await expect(api.post('/items', { name: 'New' })).resolves.toEqual({ data: { id: '1' } });
    expect(attempts).toBe(2);
  });
});
