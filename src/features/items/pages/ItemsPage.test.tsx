import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import ar from '@/shared/i18n/locales/ar.json';
import { formatNumber } from '@/shared/lib/format';
import { makeItems, paginated } from '@/test/fixtures';
import { handlers } from '@/test/handlers';
import { renderApp } from '@/test/renderApp';
import { server } from '@/test/server';

const t = ar.items;

/** Signed in; `/items` answers with `respond` and records each request's query string. */
function mockItemsApi(respond: (searchParams: URLSearchParams) => Response | Promise<Response>) {
  const requests: URLSearchParams[] = [];
  server.use(
    handlers.signedIn(),
    http.get('/api/v1/items', ({ request }) => {
      const { searchParams } = new URL(request.url);
      requests.push(searchParams);
      return respond(searchParams);
    }),
  );
  return { requests };
}

describe('ItemsPage', () => {
  it('shows a loading state, then the items with their page', async () => {
    let releaseResponse = () => {};
    const responseReleased = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    const { requests } = mockItemsApi(async () => {
      await responseReleased;
      return HttpResponse.json(paginated(makeItems(15), { lastPage: 2, total: 30 }));
    });
    renderApp('/items');

    expect(await screen.findByRole('heading', { name: t.title })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(ar.common.loading);

    releaseResponse();

    expect(await screen.findByRole('heading', { name: 'Item 1' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(15);
    expect(screen.getByText(`العدد الكلي: ${formatNumber(30)}`)).toBeInTheDocument();
    expect(screen.getByText(`صفحة ${formatNumber(1)} من ${formatNumber(2)}`)).toBeInTheDocument();
    expect(requests[0]?.toString()).toBe('page=1&per_page=15');
  });

  it('shows an empty state when there are no items', async () => {
    mockItemsApi(() => HttpResponse.json(paginated([])));
    renderApp('/items');

    expect(await screen.findByRole('heading', { name: t.empty.title })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: ar.pagination.label })).not.toBeInTheDocument();
  });

  it('shows the API error and retries', async () => {
    let attempts = 0;
    mockItemsApi(() => {
      attempts += 1;
      return attempts === 1
        ? HttpResponse.json({ message: 'خطأ في الخادم.', code: 'server_error' }, { status: 500 })
        : HttpResponse.json(paginated(makeItems(2)));
    });
    const { user } = renderApp('/items');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('خطأ في الخادم.');

    await user.click(within(alert).getByRole('button', { name: ar.common.retry }));

    expect(await screen.findByRole('heading', { name: 'Item 2' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the page in the URL and loads the next page', async () => {
    const { requests } = mockItemsApi((searchParams) => {
      const page = Number(searchParams.get('page'));
      return HttpResponse.json(
        paginated(makeItems(15, (page - 1) * 15 + 1), { page, lastPage: 2, total: 30 }),
      );
    });
    const { user, router } = renderApp('/items');

    await user.click(await screen.findByRole('button', { name: ar.pagination.next }));

    expect(await screen.findByRole('heading', { name: 'Item 16' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?page=2');
    expect(requests.at(-1)?.get('page')).toBe('2');
    expect(screen.getByRole('button', { name: ar.pagination.next })).toBeDisabled();
  });

  it('searches from the first page and keeps the search in the URL', async () => {
    const { requests } = mockItemsApi((searchParams) =>
      HttpResponse.json(
        searchParams.get('search') === 'Item 7'
          ? paginated(makeItems(1, 7))
          : paginated(makeItems(15, 16), { page: 2, lastPage: 2, total: 30 }),
      ),
    );
    const { user, router } = renderApp('/items?page=2');

    await user.type(await screen.findByRole('searchbox', { name: t.search.label }), 'Item 7');
    await user.click(screen.getByRole('button', { name: t.search.submit }));

    expect(await screen.findByRole('heading', { name: 'Item 7' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?search=Item+7');
    expect(requests.at(-1)?.get('page')).toBe('1');
  });

  it('shows a no-results state that clears the search', async () => {
    mockItemsApi((searchParams) =>
      HttpResponse.json(searchParams.has('search') ? paginated([]) : paginated(makeItems(3))),
    );
    const { user, router } = renderApp('/items?search=nothing');

    expect(await screen.findByRole('heading', { name: t.noResults.title })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: t.search.label })).toHaveValue('nothing');

    await user.click(screen.getByRole('button', { name: t.noResults.clear }));

    expect(await screen.findByRole('heading', { name: 'Item 1' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('');
    expect(screen.getByRole('searchbox', { name: t.search.label })).toHaveValue('');
  });

  it('sends the user to login when the session has expired', async () => {
    server.use(
      handlers.signedIn(),
      http.get('/api/v1/items', () =>
        HttpResponse.json(
          { message: 'Unauthenticated.', code: 'unauthenticated' },
          { status: 401 },
        ),
      ),
    );
    const { router } = renderApp('/items');

    expect(await screen.findByRole('heading', { name: ar.auth.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });
});
