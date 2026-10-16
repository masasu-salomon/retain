import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types';
import LoadingState from '../common/LoadingState';
import ForbiddenState from '../common/ForbiddenState';

interface ProtectedRouteProps {
  /** When given, the signed-in user must hold one of these roles. */
  roles?: Role[];
}

/**
 * Guards nested routes using the AuthContext:
 * - while the session is being restored, shows a loader
 * - signed-out users are sent to /login (and returned afterwards)
 * - signed-in users without the required role see a 403 message
 */
export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { status, hasRole } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingState fullScreen label="Restoring your session..." />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !hasRole(...roles)) {
    return <ForbiddenState />;
  }

  return <Outlet />;
}
