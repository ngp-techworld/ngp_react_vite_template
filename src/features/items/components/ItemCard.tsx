import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/format';
import type { Item } from '../types';

type ItemCardProps = {
  item: Item;
};

export function ItemCard({ item }: ItemCardProps) {
  const { t } = useTranslation();
  const hasDescription = item.description !== null && item.description !== '';

  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <h2 className="font-semibold text-ink">{item.name}</h2>
      <p className={cn('mt-1 text-sm', hasDescription ? 'text-muted' : 'text-faint')}>
        {hasDescription ? item.description : t('items.noDescription')}
      </p>
      <time dateTime={item.created_at} className="mt-3 block text-xs text-muted">
        {formatDate(item.created_at)}
      </time>
    </article>
  );
}
