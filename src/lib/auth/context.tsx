"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadAuth, clearAuth, login as clientLogin, authHeader } from './client';

type Ctx = {
  token: string | null;
  isAuthenticated: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  authHeader: () => HeadersInit;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { token } = loadAuth();
    setToken(token);
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'myadmin_auth') {
        const { token } = loadAuth();
        setToken(token);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<Ctx>(() => ({
    token,
    isAuthenticated: !!token,
    login: async (u, p) => {
      const data = await clientLogin(u, p);
      setToken(data.token);
    },
    logout: () => {
      clearAuth();
      setToken(null);
    },
    authHeader: () => authHeader(),
  }), [token]);

  // Avoid flashing content before we know auth state
  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

