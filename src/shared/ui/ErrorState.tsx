import { RotateCw, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

type ErrorStateProps = {
  /** Usually `error.message` from an ApiError: already translated by the backend. */
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export function ErrorState({ message, onRetry, isRetrying = false }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <TriangleAlert aria-hidden className="size-10 text-bad" />
      <p className="max-w-sm text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} isLoading={isRetrying}>
          {!isRetrying && <RotateCw aria-hidden className="size-4" />}
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
