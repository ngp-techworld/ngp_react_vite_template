import { useTranslation } from 'react-i18next';
import { config } from '@/shared/config';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { LanguageSwitcher } from '@/shared/ui';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('auth.login.title'));

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex justify-end p-2">
        <LanguageSwitcher />
      </div>
      <main className="flex flex-1 items-start justify-center px-4 pt-6 sm:items-center sm:pt-0">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold text-accent">{config.appName}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{t('auth.login.title')}</h1>
          <p className="mt-1 mb-6 text-sm text-muted">{t('auth.login.subtitle')}</p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
