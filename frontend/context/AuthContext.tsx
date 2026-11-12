'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'viewer' | 'researcher' | 'admin' | string;
  is_active?: boolean;
  created_at?: string | null;
}

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  signup: (email: string, password: string, name: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => ({ ok: false }),
  signup: async () => ({ ok: false }),
  logout: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      // Remove any stale legacy mock session key from localStorage
      try {
        localStorage.removeItem('quantum_vision_user');
      } catch {
        // Ignore storage errors
      }
      const res = await apiFetch('/api/auth/me', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string): Promise<AuthActionResult> => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        setUser(data.user);
        return { ok: true };
      }
      return {
        ok: false,
        error: data.detail || 'Authentication failed. Check your email and password.',
      };
    } catch {
      return { ok: false, error: 'Authentication service is temporarily unreachable.' };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<AuthActionResult> => {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        setUser(data.user);
        return { ok: true };
      }
      return {
        ok: false,
        error: data.detail || 'Unable to register account.',
      };
    } catch {
      return { ok: false, error: 'Registration service is temporarily unreachable.' };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' }, false);
    } catch {
      // Ignore network issues while clearing client state
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
