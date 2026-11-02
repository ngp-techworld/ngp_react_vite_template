import { Search } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

type SearchInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** Accessible name; the search icon and placeholder replace a visible label. */
  label: string;
};

export function SearchInput({ label, className, ...inputProps }: SearchInputProps) {
  return (
    <div className="relative flex-1">
      <Search
        aria-hidden
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-faint"
      />
      <input
        type="search"
        aria-label={label}
        className={cn(
          'h-11 w-full rounded-lg border border-line-strong bg-surface ps-9 pe-3 text-base text-ink placeholder:text-faint focus-visible:border-primary',
          className,
        )}
        {...inputProps}
      />
    </div>
  );
}
