# NGP React + Vite starter

Follow the NGP standards: `ngp-general` always, plus `ngp-react` for everything in this repo.
How the code is organized: `ARCHITECTURE.md`.

## Local setup

- App: http://127.0.0.1:5173 (`npm run dev`; Vite proxies /api, /sanctum, /storage to the API)
- API: the Laravel starter (`ngp_laravel_api_template`) on http://127.0.0.1:8000, auth mode A
  (Sanctum SPA cookie). Unit and e2e tests mock it; they don't need it running.
- `vite preview` and Playwright: http://127.0.0.1:4173

## Commands

- Checks: `npm run lint && npm run lint:rtl && npm run format:check && npm run typecheck && npm test && npm run build`
- E2E: `npm run test:e2e` (first time: `npx playwright install chromium`)
- API types: `npm run api:types` (needs the API running)

## Don't

- Don't commit `.env*` files (except `.env.example`).
- Don't call `fetch` outside `src/shared/api/client.ts`; components use hooks from the feature's `api.ts`.
- Don't use physical-direction classes (`ml-`, `pr-`, `left-`, `text-right`...); use logical ones.
- Don't hard-code user-facing text; add it to both `src/shared/i18n/locales/ar.json` and `en.json`.
- Don't edit `src/shared/api/schema.d.ts` by hand; regenerate it.
- Don't import another feature's internal files, only its `index.ts`.
