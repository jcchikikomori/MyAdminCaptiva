export type AuthState = {
  token: string | null;
  expiresAt: number | null;
};

const KEY = 'myadmin_auth';

export function loadAuth(): AuthState {
  if (typeof window === 'undefined') return { token: null, expiresAt: null };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { token: null, expiresAt: null };
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.expiresAt) return { token: null, expiresAt: null };
    const now = Math.floor(Date.now() / 1000);
    if (parsed.expiresAt <= now) {
      window.localStorage.removeItem(KEY);
      return { token: null, expiresAt: null };
    }
    return { token: parsed.token as string, expiresAt: parsed.expiresAt as number };
  } catch {
    return { token: null, expiresAt: null };
  }
}

export function saveAuth(token: string, expiresIn: number) {
  if (typeof window === 'undefined') return;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + expiresIn;
  window.localStorage.setItem(KEY, JSON.stringify({ token, expiresAt }));
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

export async function login(username: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(msg.error || 'Login failed');
  }
  const data: { token: string; expiresIn: number } = await res.json();
  saveAuth(data.token, data.expiresIn);
  return data;
}

export function authHeader(): HeadersInit {
  const { token } = loadAuth();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

