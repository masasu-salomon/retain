import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingState from '../common/LoadingState';

/** Pages like sign in / sign up that only make sense when signed out. */
export default function GuestRoute() {
  const { status } = useAuth();

  if (status === 'loading') return <LoadingState fullScreen />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}
