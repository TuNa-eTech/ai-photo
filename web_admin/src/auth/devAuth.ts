export const isDevAuth = String(import.meta.env.VITE_DEV_AUTH || '').trim() === '1' || String(import.meta.env.VITE_DEV_AUTH || '').toLowerCase() === 'true';

const TOKEN_KEY = 'dev_admin_token';

export function setDevToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getDevToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearDevToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export type DevLoginResponse = {
  token: string;
  email: string;
  role: string;
};

export async function devLogin(baseURL: string, email: string, password: string): Promise<DevLoginResponse> {
  const res = await fetch(`${baseURL.replace(/\/$/, '')}/v1/dev/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Login failed (${res.status})`);
  }
  const env = await res.json();
  if (!env?.success || !env?.data?.token) {
    throw new Error(env?.error?.message || 'Login failed');
  }
  return env.data as DevLoginResponse;
}

export async function devWhoAmI(baseURL: string, token: string) {
  const res = await fetch(`${baseURL.replace(/\/$/, '')}/v1/dev/whoami`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const env = await res.json();
  if (!env?.success) return null;
  return env.data as { email: string; role: string };
}
