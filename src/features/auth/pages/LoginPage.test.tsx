import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import ar from '@/shared/i18n/locales/ar.json';
import { demoUser, makeItems, paginated } from '@/test/fixtures';
import { handlers, testXsrfToken } from '@/test/handlers';
import { renderApp } from '@/test/renderApp';
import { server } from '@/test/server';

const t = ar.auth.login;

/** Guest on /login; `me` answers with the user once the login request succeeded. */
function mockLoginApi(loginResponse: () => Response) {
  let isSignedIn = false;
  const loginRequests: { body: unknown; xsrfToken: string | null }[] = [];

  server.use(
    handlers.csrfCookie(),
    http.get('/api/v1/auth/me', () =>
      isSignedIn
        ? HttpResponse.json({ data: demoUser })
        : HttpResponse.json(
            { message: 'Unauthenticated.', code: 'unauthenticated' },
            { status: 401 },
          ),
    ),
    http.post('/api/v1/auth/login', async ({ request }) => {
      loginRequests.push({
        body: await request.json(),
        xsrfToken: request.headers.get('X-XSRF-TOKEN'),
      });
      const response = loginResponse();
      isSignedIn = response.ok;
      return response;
    }),
    http.get('/api/v1/items', () => HttpResponse.json(paginated(makeItems(3)))),
  );

  return { loginRequests };
}

describe('LoginPage', () => {
  it('renders the Arabic form right to left', async () => {
    server.use(handlers.guest());
    renderApp('/login');

    expect(await screen.findByRole('heading', { name: t.title })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(document.documentElement).toHaveAttribute('lang', 'ar');
    expect(screen.getByLabelText(t.email)).toBeInTheDocument();
    expect(screen.getByLabelText(t.password)).toBeInTheDocument();
  });

  it('validates the fields before calling the API', async () => {
    const { loginRequests } = mockLoginApi(() => HttpResponse.json({ data: demoUser }));
    const { user } = renderApp('/login');

    await user.click(await screen.findByRole('button', { name: t.submit }));

    expect(await screen.findByText(ar.validation.email)).toBeInTheDocument();
    expect(screen.getByText(ar.validation.required)).toBeInTheDocument();
    expect(screen.getByLabelText(t.email)).toHaveAttribute('aria-invalid', 'true');
    expect(loginRequests).toHaveLength(0);
  });

  it('shows 422 errors from the API under the matching field', async () => {
    const message = 'بيانات الدخول غير صحيحة.';
    mockLoginApi(() =>
      HttpResponse.json(
        { message, code: 'invalid_credentials', errors: { email: [message] } },
        { status: 422 },
      ),
    );
    const { user } = renderApp('/login');

    await user.type(await screen.findByLabelText(t.email), 'demo@example.com');
    await user.type(screen.getByLabelText(t.password), 'wrong-password');
    await user.click(screen.getByRole('button', { name: t.submit }));

    const emailInput = screen.getByLabelText(t.email);
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAccessibleDescription(message);
    expect(emailInput).toHaveFocus();
  });

  it('shows errors without field details above the form', async () => {
    const message = 'محاولات كثيرة. حاول بعد دقيقة.';
    mockLoginApi(() => HttpResponse.json({ message, code: 'too_many_requests' }, { status: 429 }));
    const { user } = renderApp('/login');

    await user.type(await screen.findByLabelText(t.email), 'demo@example.com');
    await user.type(screen.getByLabelText(t.password), 'password');
    await user.click(screen.getByRole('button', { name: t.submit }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
  });

  it('signs in with the CSRF cookie and returns to the page the guest asked for', async () => {
    const { loginRequests } = mockLoginApi(() => HttpResponse.json({ data: demoUser }));
    const { user, router } = renderApp('/items?page=2');

    // RequireAuth sent the guest to /login.
    await user.type(await screen.findByLabelText(t.email), 'demo@example.com');
    expect(router.state.location.pathname).toBe('/login');
    await user.type(screen.getByLabelText(t.password), 'password');
    await user.click(screen.getByLabelText(t.remember));
    await user.click(screen.getByRole('button', { name: t.submit }));

    expect(await screen.findByRole('heading', { name: ar.items.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/items');
    expect(router.state.location.search).toBe('?page=2');
    expect(loginRequests).toEqual([
      {
        body: { email: 'demo@example.com', password: 'password', remember: true },
        xsrfToken: testXsrfToken,
      },
    ]);
  });

  it('signs out and goes back to the login page', async () => {
    let isSignedIn = true;
    server.use(
      http.get('/api/v1/auth/me', () =>
        isSignedIn
          ? HttpResponse.json({ data: demoUser })
          : HttpResponse.json(
              { code: 'unauthenticated', message: 'Unauthenticated.' },
              { status: 401 },
            ),
      ),
      http.get('/api/v1/items', () => HttpResponse.json(paginated(makeItems(1)))),
      http.post('/api/v1/auth/logout', () => {
        isSignedIn = false;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user, router } = renderApp('/items');

    await user.click(await screen.findByRole('button', { name: ar.auth.logout }));

    expect(await screen.findByRole('heading', { name: t.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });
});
