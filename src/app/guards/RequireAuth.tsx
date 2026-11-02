import { Navigate, Outlet, useLocation } from 'react-router';
import { useMe } from '@/features/auth';
import { ErrorState, LoadingState } from '@/shared/ui';
import { paths } from '../paths';

/** Renders the child routes for signed-in users; sends guests to /login and back afterwards. */
export function RequireAuth() {
  const location = useLocation();
  const me = useMe();

  if (me.isPending) {
    return <LoadingState className="min-h-dvh" />;
  }

  if (me.isError) {
    return (
      <ErrorState
        message={me.error.message}
        onRetry={() => void me.refetch()}
        isRetrying={me.isFetching}
      />
    );
  }

  if (me.data === null) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={paths.login} replace state={{ from }} />;
  }

  return <Outlet />;
}
