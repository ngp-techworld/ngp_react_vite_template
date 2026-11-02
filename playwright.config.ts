import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const baseURL = 'http://127.0.0.1:4173';

// E2E tests run the production build (`vite preview`) on a phone viewport in Arabic.
// The API is mocked in each test with `page.route`, so no Laravel server is needed.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    locale: 'ar',
    timezoneId: 'Asia/Damascus',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'], locale: 'ar' },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
