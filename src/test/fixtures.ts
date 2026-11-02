import type { User } from '@/features/auth';
import type { Item } from '@/features/items';
import type { Paginated } from '@/shared/api';

export const demoUser: User = {
  id: '01JC0000000000000000000001',
  name: 'Demo User',
  email: 'demo@example.com',
  created_at: '2026-11-02T09:44:00Z',
};

/** `count` items named "Item <n>", starting at `firstNumber`. Even items have no description. */
export function makeItems(count: number, firstNumber = 1): Item[] {
  return Array.from({ length: count }, (_, index) => {
    const number = firstNumber + index;
    return {
      id: `01JC${String(number).padStart(22, '0')}`,
      name: `Item ${number}`,
      description: number % 2 === 0 ? null : `Description ${number}`,
      created_at: '2026-11-02T09:44:00Z',
    };
  });
}

/** A Laravel paginated response for one page of `data`. */
export function paginated<T>(
  data: T[],
  { page = 1, lastPage = 1, total = data.length, perPage = 15 } = {},
): Paginated<T> {
  return {
    data,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: data.length > 0 ? (page - 1) * perPage + 1 : null,
      last_page: lastPage,
      links: [],
      path: 'http://localhost:3000/api/v1/items',
      per_page: perPage,
      to: data.length > 0 ? (page - 1) * perPage + data.length : null,
      total,
    },
  };
}
