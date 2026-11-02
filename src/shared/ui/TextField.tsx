import { useId, type ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  /** Shown under the input and linked to it for screen readers. */
  error?: string;
};

export function TextField({ label, error, id, className, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = error !== undefined && error !== '';

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={cn(
          // text-base (16px) stops iOS from zooming into the field on focus.
          'h-11 rounded-lg border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-faint focus-visible:border-primary aria-invalid:border-bad',
          className,
        )}
        {...inputProps}
      />
      {hasError && (
        <p id={errorId} className="text-sm text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
