import { useId, type ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string;
};

export function Checkbox({ label, id, className, ...inputProps }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex items-center gap-2">
      <input
        id={inputId}
        type="checkbox"
        className={cn('size-4 accent-primary', className)}
        {...inputProps}
      />
      <label htmlFor={inputId} className="text-sm text-ink">
        {label}
      </label>
    </div>
  );
}
