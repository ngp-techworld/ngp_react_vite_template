import { FileQuestion } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { EmptyState } from '@/shared/ui';
import { homePath } from '../paths';

export function NotFoundPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('notFound.title'));

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={FileQuestion}
        title={t('notFound.title')}
        description={t('notFound.description')}
        action={
          <Link to={homePath} className="font-semibold text-primary underline">
            {t('notFound.backHome')}
          </Link>
        }
      />
    </main>
  );
}
