import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { i18n } from '@/shared/i18n';
import { server } from './server';

// A request without a handler fails and MSW prints which one, so nothing reaches a real network.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  await i18n.changeLanguage('ar');
  localStorage.clear();
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
});

afterAll(() => server.close());
