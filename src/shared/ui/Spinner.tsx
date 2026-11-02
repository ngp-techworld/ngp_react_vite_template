import { LoaderCircle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type SpinnerProps = {
  className?: string;
};

/** Decorative spinner. Pair it with visible text or `role="status"` for screen readers. */
export function Spinner({ className }: SpinnerProps) {
  return <LoaderCircle aria-hidden className={cn('size-4 animate-spin', className)} />;
}
