import { Navigate, Outlet, useLocation } from 'react-router';
import { useMe } from '@/features/auth';
import { LoadingState } from '@/shared/ui';
import { paths } from '../paths';

/** The page RequireAuth sent the user away from, if it is a path inside this app. */
function redirectTarget(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string' &&
    state.from.startsWith('/') &&
    !state.from.startsWith('//')
  ) {
    return state.from;
  }
  return paths.home;
}

/** For /login: signed-in users (including right after logging in) go on to the app. */
export function RequireGuest() {
  const location = useLocation();
  const me = useMe();

  if (me.isPending) {
    return <LoadingState className="min-h-dvh" />;
  }

  if (me.data) {
    return <Navigate to={redirectTarget(location.state)} replace />;
  }

  // Guests, and also a failed session check: the login form shows any API problem itself.
  return <Outlet />;
}
