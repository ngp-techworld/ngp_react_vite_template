import { SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { formatNumber } from '@/shared/lib/format';
import { Button, EmptyState, ErrorState, LoadingState, Pagination } from '@/shared/ui';
import { useItems } from '../api';
import { ItemList } from '../components/ItemList';
import { ItemsSearchForm } from '../components/ItemsSearchForm';
import { parseItemFilters, toSearchParams, type ItemFilters } from '../schemas';

export function ItemsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('items.title'));
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseItemFilters(searchParams);
  const itemsQuery = useItems(filters);

  function changeFilters(changes: Partial<ItemFilters>) {
    setSearchParams(toSearchParams({ ...filters, ...changes }));
  }

  let content: ReactNode;
  if (itemsQuery.isPending) {
    content = <LoadingState />;
  } else if (itemsQuery.isError) {
    content = (
      <ErrorState
        message={itemsQuery.error.message}
        onRetry={() => void itemsQuery.refetch()}
        isRetrying={itemsQuery.isFetching}
      />
    );
  } else if (itemsQuery.data.data.length > 0) {
    const { meta } = itemsQuery.data;
    content = (
      <>
        <ItemList items={itemsQuery.data.data} isUpdating={itemsQuery.isPlaceholderData} />
        <Pagination
          page={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={(page) => changeFilters({ page })}
        />
      </>
    );
  } else if (filters.search !== '') {
    content = (
      <EmptyState
        icon={SearchX}
        title={t('items.noResults.title')}
        description={t('items.noResults.description', { search: filters.search })}
        action={
          <Button variant="secondary" onClick={() => changeFilters({ search: '', page: 1 })}>
            {t('items.noResults.clear')}
          </Button>
        }
      />
    );
  } else if (itemsQuery.data.meta.total > 0) {
    // A page number past the end, e.g. an old shared link after items were deleted.
    content = (
      <EmptyState
        title={t('items.pageEmpty.title')}
        action={
          <Button variant="secondary" onClick={() => changeFilters({ page: 1 })}>
            {t('items.pageEmpty.firstPage')}
          </Button>
        }
      />
    );
  } else {
    content = (
      <EmptyState title={t('items.empty.title')} description={t('items.empty.description')} />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold text-ink">{t('items.title')}</h1>
        {itemsQuery.data && (
          <p className="text-sm text-muted">
            {t('items.total', { total: formatNumber(itemsQuery.data.meta.total) })}
          </p>
        )}
      </div>
      <ItemsSearchForm
        search={filters.search}
        onSearch={(search) => changeFilters({ search, page: 1 })}
      />
      {content}
    </section>
  );
}
