// Hand-written from the API contract (UserResource) until `npm run api:types` can run against the
// Laravel starter. Then replace with the generated type:
//   import type { components } from '@/shared/api/schema';
//   export type User = components['schemas']['UserResource'];
export type User = {
  id: string;
  name: string;
  email: string;
  /** ISO 8601 UTC, e.g. `2026-11-02T09:44:00Z`. */
  created_at: string;
};
