// Response envelopes of the Laravel API (API Resources). Feature types live in features/*/types.ts.

/** A single resource: `{ "data": { ... } }`. */
export type Resource<T> = {
  data: T;
};

/** Laravel's paginated resource collection. */
export type Paginated<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
};

export type PaginationMeta = {
  current_page: number;
  /** `null` when the page is empty. */
  from: number | null;
  last_page: number;
  links: { url: string | null; label: string; active: boolean }[];
  path: string;
  per_page: number;
  /** `null` when the page is empty. */
  to: number | null;
  total: number;
};
