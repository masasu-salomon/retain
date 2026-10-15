import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { onUnauthorized, tokenStorage } from '../api/client';
import { useAppDispatch } from '../store/hooks';
import { resetFilters } from '../store/expenseFiltersSlice';
import type { LoginCredentials, RegisterPayload, User } from '../types';
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext';

/**
 * Owns the authentication state for the whole app: the signed-in user, their role
 * and the sign up / sign in / sign out actions. The JWT is kept in localStorage
 * so a session survives page reloads, and is verified against /auth/me on startup.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'loading' : 'unauthenticated'));

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('unauthenticated');
    // Don't leak one user's filters into the next session on a shared device.
    dispatch(resetFilters());
  }, [dispatch]);

  // Restore an existing session on first load.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    const controller = new AbortController();
    authApi
      .me(controller.signal)
      .then((currentUser) => {
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        tokenStorage.clear();
        setStatus('unauthenticated');
      });
    return () => controller.abort();
  }, []);

  // Any 401 from the API (expired or revoked token) signs the user out.
  useEffect(() => {
    onUnauthorized(logout);
    return () => onUnauthorized(null);
  }, [logout]);

  const startSession = useCallback((token: string, nextUser: User) => {
    tokenStorage.set(token);
    setUser(nextUser);
    setStatus('authenticated');
    return nextUser;
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { token, user: nextUser } = await authApi.login(credentials);
      return startSession(token, nextUser);
    },
    [startSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { token, user: nextUser } = await authApi.register(payload);
      return startSession(token, nextUser);
    },
    [startSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isAdmin: user?.role === 'ADMIN',
      hasRole: (...roles) => (user ? roles.includes(user.role) : false),
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
