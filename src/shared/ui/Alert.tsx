import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

type AlertProps = {
  children: ReactNode;
};

/** A form-level error (rate limit, server error) that doesn't belong to one field. */
export function Alert({ children }: AlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-bad-soft p-3 text-sm text-bad"
    >
      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
