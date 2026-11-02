import { z } from 'zod';

/**
 * The list filters live in the URL (`/items?page=2&search=tea`), so a list can be shared and
 * survives a reload. Bad or missing values fall back to the defaults instead of failing.
 */
export const itemFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: z.string().trim().max(100).catch(''),
});

export type ItemFilters = z.infer<typeof itemFiltersSchema>;

export function parseItemFilters(searchParams: URLSearchParams): ItemFilters {
  return itemFiltersSchema.parse({
    page: searchParams.get('page') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  });
}

/** Default values stay out of the URL: `/items` rather than `/items?page=1&search=`. */
export function toSearchParams(filters: ItemFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (filters.page > 1) {
    searchParams.set('page', String(filters.page));
  }
  if (filters.search !== '') {
    searchParams.set('search', filters.search);
  }
  return searchParams;
}
