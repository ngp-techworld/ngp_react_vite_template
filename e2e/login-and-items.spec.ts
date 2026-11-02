import { expect, test, type Page } from '@playwright/test';
import ar from '../src/shared/i18n/locales/ar.json' with { type: 'json' };

const demoUser = {
  id: '01JC0000000000000000000001',
  name: 'Demo User',
  email: 'demo@example.com',
  created_at: '2026-11-02T09:44:00Z',
};

const allItems = Array.from({ length: 30 }, (_, index) => ({
  id: `01JC${String(index + 1).padStart(22, '0')}`,
  name: `Item ${index + 1}`,
  description: index % 2 === 0 ? `Description ${index + 1}` : null,
  created_at: '2026-11-02T09:44:00Z',
}));

const xsrfToken = 'e2e-xsrf-token';
const perPage = 15;

/** Mocks the Laravel starter API (auth mode A + items) as described in the API contract. */
async function mockApi(page: Page) {
  let isSignedIn = false;
  const loginRequests: { body: unknown; xsrfToken: string | null }[] = [];

  await page.route('**/sanctum/csrf-cookie', (route) =>
    route.fulfill({ status: 204, headers: { 'Set-Cookie': `XSRF-TOKEN=${xsrfToken}; Path=/` } }),
  );

  await page.route('**/api/v1/auth/me', (route) =>
    isSignedIn
      ? route.fulfill({ json: { data: demoUser } })
      : route.fulfill({
          status: 401,
          json: { message: 'Unauthenticated.', code: 'unauthenticated' },
        }),
  );

  await page.route('**/api/v1/auth/login', async (route) => {
    loginRequests.push({
      body: route.request().postDataJSON(),
      xsrfToken: await route.request().headerValue('X-XSRF-TOKEN'),
    });
    isSignedIn = true;
    await route.fulfill({ json: { data: demoUser } });
  });

  await page.route('**/api/v1/auth/logout', (route) => {
    isSignedIn = false;
    return route.fulfill({ status: 204 });
  });

  await page.route(
    (url) => url.pathname === '/api/v1/items',
    (route) => {
      const url = new URL(route.request().url());
      const pageNumber = Number(url.searchParams.get('page') ?? '1');
      const search = (url.searchParams.get('search') ?? '').toLowerCase();
      const matching = allItems.filter((item) => item.name.toLowerCase().includes(search));
      const data = matching.slice((pageNumber - 1) * perPage, pageNumber * perPage);
      return route.fulfill({
        json: {
          data,
          links: { first: null, last: null, prev: null, next: null },
          meta: {
            current_page: pageNumber,
            from: data.length > 0 ? (pageNumber - 1) * perPage + 1 : null,
            last_page: Math.max(1, Math.ceil(matching.length / perPage)),
            links: [],
            path: url.origin + url.pathname,
            per_page: perPage,
            to: data.length > 0 ? (pageNumber - 1) * perPage + data.length : null,
            total: matching.length,
          },
        },
      });
    },
  );

  return { loginRequests };
}

test('a guest signs in, pages and searches the items, then signs out', async ({ page }) => {
  const api = await mockApi(page);

  await page.goto('/');

  // Guests land on the Arabic, right-to-left login page.
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  await page.getByLabel(ar.auth.login.email).fill('demo@example.com');
  await page.getByLabel(ar.auth.login.password).fill('password');
  await page.getByRole('button', { name: ar.auth.login.submit }).click();

  await expect(page).toHaveURL(/\/items$/);
  await expect(page.getByRole('heading', { name: ar.items.title })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Item 1', exact: true })).toBeVisible();
  expect(api.loginRequests).toEqual([
    { body: { email: 'demo@example.com', password: 'password', remember: false }, xsrfToken },
  ]);

  await page.getByRole('button', { name: ar.pagination.next }).click();
  await expect(page).toHaveURL(/\/items\?page=2$/);
  await expect(page.getByRole('heading', { name: 'Item 16', exact: true })).toBeVisible();

  await page.getByRole('searchbox', { name: ar.items.search.label }).fill('Item 7');
  await page.getByRole('button', { name: ar.items.search.submit, exact: true }).click();
  await expect(page).toHaveURL(/\/items\?search=Item\+7$/);
  await expect(page.getByRole('listitem')).toHaveCount(1);

  await page.getByRole('button', { name: ar.auth.logout }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: ar.auth.login.title })).toBeVisible();
});
