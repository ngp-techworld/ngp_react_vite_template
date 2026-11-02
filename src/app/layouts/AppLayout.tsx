import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router';
import { useLogout, useMe } from '@/features/auth';
import { config } from '@/shared/config';
import { Button, LanguageSwitcher } from '@/shared/ui';
import { homePath } from '../paths';

/** Header + page container for every signed-in page. */
export function AppLayout() {
  const { t } = useTranslation();
  const me = useMe();
  const logout = useLogout();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Link to={homePath} className="font-bold text-primary">
            {config.appName}
          </Link>
          <div className="flex items-center gap-1">
            <span className="hidden text-sm text-muted sm:inline">{me.data?.name}</span>
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout.mutate()}
              isLoading={logout.isPending}
            >
              {!logout.isPending && <LogOut aria-hidden className="size-4 rtl:rotate-180" />}
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
