import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';
import { Spinner } from './Spinner';

const variantClasses = {
  primary: 'bg-primary text-on-primary hover:bg-primary-dark',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-2',
};

const sizeClasses = {
  md: 'h-11 px-4', // 44px: comfortable touch target on phones
  sm: 'h-9 px-3',
};

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  /** Disables the button and shows a spinner, e.g. while a mutation is pending. */
  isLoading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}
