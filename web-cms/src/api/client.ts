import axios, { AxiosError } from 'axios';
import { getIdToken } from '../auth/firebase';
import { isDevAuth, getDevToken } from '../auth/devAuth';
import type { Envelope, APIError } from '../types/envelope';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120000,
});

// Inject Bearer token for authenticated requests
api.interceptors.request.use(async (config) => {
  // Dev auth: attach dev token if present
  if (isDevAuth) {
    const token = getDevToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return config;
  }

  // Firebase auth (default)
  const token = await getIdToken(true);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single 401 refresh-and-retry
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as (typeof error.config) & { _retry?: boolean };

    if (isDevAuth) {
      // No refresh flow for dev auth; surface error
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && config && !config._retry) {
      config._retry = true;
      const token = await getIdToken(true);
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        return api(config);
      }
    }
    return Promise.reject(error);
  },
);

// Envelope unwrap helper
export async function unwrap<T>(promise: Promise<any>): Promise<T> {
  const res = await promise;
  const env = res.data as Envelope<T>;
  if (!env.success || env.data == null) {
    const err = env.error as APIError | undefined;
    const msg = err?.message ?? 'API error';
    const e = new Error(msg);
    (e as any).code = err?.code;
    (e as any).meta = env.meta;
    throw e;
  }
  return env.data;
}

export default api;
