import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/authContext';

/** Access the authentication state and actions provided by <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
