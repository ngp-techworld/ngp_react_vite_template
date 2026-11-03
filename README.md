# NGP React + Vite starter

Starter repo for NGP TechWorld single-page apps (dashboards, admin panels, customer web apps).
It follows the `ngp-general` and `ngp-react` standards and ships one working example end to end:
Sanctum cookie login and a paginated, searchable items list, in Arabic and right to left by default.

It is the frontend only. It talks to the Laravel API starter (`ngp-techworld/ngp_laravel_api_template`)
on `http://127.0.0.1:8000`, using the shared starter API contract with auth mode A (Sanctum SPA cookie).

## Parts

| Folder     | What             | Stack                                                                                                                   |
| ---------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/`     | The SPA          | React 19, Vite 8, TypeScript (strict), Tailwind CSS 4, React Router 8, TanStack Query 5, react-hook-form + zod, i18next |
| `e2e/`     | End-to-end tests | Playwright (mobile viewport, `ar` locale)                                                                               |
| `scripts/` | Repo scripts     | `lint-rtl.ts`                                                                                                           |

## Run locally

Requirements: Node 24 LTS at its latest patch, at least 24.22.2, and npm. `.npmrc` sets
`engine-strict`, so npm refuses older Node releases (they have known security issues); raise the
floor in `package.json` `engines` when a new Node security release comes out.

For real data, run the Laravel starter on `http://127.0.0.1:8000`
(`php artisan migrate --seed && php artisan serve` in that repo).

```bash
npm ci
npm run dev        # http://127.0.0.1:5173 (proxies /api, /sanctum, /storage to :8000)
```

Sign in with the local demo user that the Laravel starter's seeder creates (see its README).
No `.env` is needed for local work; to change the app name or API URL, copy `.env.example` to
`.env.local`.

## Tests

```bash
npm test               # unit tests: Vitest + Testing Library + MSW
npx playwright install chromium   # once per machine
npm run test:e2e       # builds, serves with `vite preview`, runs Playwright with the API mocked
```

## Scripts

| Script                             | What it does                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `dev` / `build` / `preview`        | Vite dev server (:5173), production build, serve the build (:4173)                     |
| `lint`                             | oxlint; warnings fail too                                                              |
| `lint:rtl`                         | fails on physical-direction classes in `src/` (`ml-`, `pr-`, `left-`, `text-right`...) |
| `format` / `format:check`          | Prettier (with Tailwind class sorting)                                                 |
| `typecheck`                        | `tsc -b` for the app, configs, scripts and e2e                                         |
| `test` / `test:watch` / `test:e2e` | unit tests once / in watch mode, Playwright                                            |
| `api:types`                        | generates `src/shared/api/schema.d.ts` from the API's OpenAPI (`/docs/api.json`)       |

CI (`.github/workflows/ci.yml`) runs audit, lint, lint:rtl, format check, typecheck, unit tests,
build and e2e on every PR and on pushes to `dev` and `main`.

## API types

With the Laravel starter running, `npm run api:types` writes `src/shared/api/schema.d.ts` from its
Scramble OpenAPI document. Never edit that file by hand; it is committed so CI can typecheck
without the API. Feature types re-export from it, e.g. `src/features/items/types.ts`:
`export type Item = components['schemas']['ItemResource'];`. Regenerate after every API change.

`openapi-typescript` runs through a pinned `npx` because it needs TypeScript 5 and this repo uses
TypeScript 7 (`npm install` would fail on the peer dependency).

## Start a new app from this template

1. Rename `name` in `package.json`, set `VITE_APP_NAME`, update the `<title>` and `theme-color` in
   `index.html` and `public/favicon.svg`.
2. Adjust the design tokens in `src/shared/styles/index.css`.
3. Build your first feature next to `features/items` (see "Adding a new feature" in
   `ARCHITECTURE.md`), then delete `features/items` and its route.
4. Update this README and `CLAUDE.md`.

## Docs

- `ARCHITECTURE.md`: layers, data flow, folders, how to add a feature
- `CLAUDE.md`: rules for Claude Code in this repo

Coding standards: NGP standards (`ngp-general` + `ngp-react`).
