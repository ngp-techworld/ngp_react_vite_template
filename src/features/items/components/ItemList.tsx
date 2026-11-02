import { cn } from '@/shared/lib/cn';
import type { Item } from '../types';
import { ItemCard } from './ItemCard';

type ItemListProps = {
  items: Item[];
  /** True while the next page loads and the previous one is still shown. */
  isUpdating: boolean;
};

export function ItemList({ items, isUpdating }: ItemListProps) {
  return (
    <ul
      aria-busy={isUpdating || undefined}
      className={cn('flex flex-col gap-3 transition-opacity', isUpdating && 'opacity-60')}
    >
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} />
        </li>
      ))}
    </ul>
  );
}
