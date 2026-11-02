import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Spinner } from './Spinner';

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label, className }: LoadingStateProps) {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-muted', className)}
    >
      <Spinner className="size-6 text-primary" />
      <span>{label ?? t('common.loading')}</span>
    </div>
  );
}
