import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client.js';
import { adminLogout } from '../api/auth.js';

const STORAGE_KEY = 'aatman-admin-auth';

const AuthContext = createContext(null);

const readStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch (error) {
    console.warn('Failed to read auth state', error);
    return null;
  }
};

const persistUser = (user) => {
  if (typeof window === 'undefined') return;
  try {
    if (!user) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.warn('Failed to persist auth state', error);
  }
};

const applyAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

const buildAuthUser = ({ email, token, admin, displayName } = {}) => {
  const adminProfile =
    admin && typeof admin === 'object' && !Array.isArray(admin) ? { ...admin } : {};
  const derivedName =
    displayName ||
    adminProfile.fullname ||
    adminProfile.full_name ||
    adminProfile.name ||
    email ||
    'User';

  return {
    email: email || adminProfile.email || null,
    token: token || null,
    admin: Object.keys(adminProfile).length > 0 ? adminProfile : null,
    displayName: derivedName
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = readStoredUser();
    if (storedUser?.token) {
      applyAuthToken(storedUser.token);
    }
    return storedUser ? buildAuthUser(storedUser) : null;
  });

  useEffect(() => {
    persistUser(user);
    applyAuthToken(user?.token);
  }, [user]);

  const login = useCallback(
    ({ email, token, admin, displayName }) => {
      setUser(buildAuthUser({ email, token, admin, displayName }));
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      setUser(null);
      applyAuthToken(null);
    }
  }, [setUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
