import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/shared/ui';

/**
 * Shown when rendering a route throws or a lazy page fails to load (often a new deploy replaced
 * the old JS chunks). Reloading fetches the current version.
 */
export function RouteErrorPage() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <ErrorState message={t('errors.page')} onRetry={() => window.location.reload()} />
    </main>
  );
}
