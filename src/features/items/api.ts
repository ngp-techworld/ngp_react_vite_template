import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, type Paginated } from '@/shared/api';
import type { ItemFilters } from './schemas';
import type { Item } from './types';

export const itemsPerPage = 15;

export const itemKeys = {
  all: ['items'] as const,
  list: (filters: ItemFilters) => [...itemKeys.all, 'list', filters] as const,
};

export function useItems(filters: ItemFilters) {
  return useQuery({
    queryKey: itemKeys.list(filters),
    queryFn: ({ signal }) =>
      api.get<Paginated<Item>>('/items', {
        query: { page: filters.page, per_page: itemsPerPage, search: filters.search },
        signal,
      }),
    // Keep the current page on screen while the next page or search result loads.
    placeholderData: keepPreviousData,
  });
}
