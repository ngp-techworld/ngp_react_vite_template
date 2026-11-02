import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/shared/lib/format';
import { Button } from './Button';

type PaginationProps = {
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, lastPage, onPageChange }: PaginationProps) {
  const { t } = useTranslation();

  if (lastPage <= 1) {
    return null;
  }

  return (
    <nav aria-label={t('pagination.label')} className="flex items-center justify-between gap-3">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {/* Chevrons point to start/end: flipped in RTL. */}
        <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
        {t('pagination.previous')}
      </Button>
      <span className="text-sm text-muted">
        {t('pagination.pageOf', { page: formatNumber(page), lastPage: formatNumber(lastPage) })}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        {t('pagination.next')}
        <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
      </Button>
    </nav>
  );
}
