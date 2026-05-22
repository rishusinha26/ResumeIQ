import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { apiClient } from '../api/client';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, role?: 'candidate' | 'recruiter') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (typeof first === 'object' && first !== null && 'msg' in first) {
        return String((first as { msg: string }).msg);
      }
    }
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((jwt: string | null) => {
    setToken(jwt);
    if (jwt) {
      localStorage.setItem('token', jwt);
      apiClient.defaults.headers.common.Authorization = `Bearer ${jwt}`;
    } else {
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common.Authorization;
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    const { data } = await apiClient.get<AuthUser>('/auth/me');
    setUser(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      applyToken(token);
      try {
        await fetchProfile();
      } catch {
        applyToken(null);
        setUser(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token, applyToken, fetchProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await apiClient.post<{ access_token: string }>('/auth/login', { email, password });
        applyToken(data.access_token);
        await fetchProfile();
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Invalid email or password.'));
      }
    },
    [applyToken, fetchProfile],
  );

  const register = useCallback(
    async (email: string, password: string, fullName?: string, role: 'candidate' | 'recruiter' = 'candidate') => {
      try {
        const { data } = await apiClient.post<{ access_token: string }>('/auth/register', {
          email,
          password,
          full_name: fullName?.trim() || null,
          role,
        });
        applyToken(data.access_token);
        await fetchProfile();
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Registration failed. Please try again.'));
      }
    },
    [applyToken, fetchProfile],
  );

  const logout = useCallback(() => {
    applyToken(null);
    setUser(null);
  }, [applyToken]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
