import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { config } from "@/config";

const TOKEN_KEY = "tokomort_access_token";
const REFRESH_KEY = "tokomort_refresh_token";

const isBrowser = typeof window !== "undefined";

export const getToken = () => (isBrowser ? localStorage.getItem(TOKEN_KEY) : null);
export const getRefreshToken = () => (isBrowser ? localStorage.getItem(REFRESH_KEY) : null);

export const setTokens = (access: string, refresh: string) => {
  if (!isBrowser) return;
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  // Sync to cookies so Next.js middleware can read them for route protection
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${TOKEN_KEY}=${access}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `${REFRESH_KEY}=${refresh}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

export const clearTokens = () => {
  if (!isBrowser) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  // Clear cookies too
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${REFRESH_KEY}=; path=/; max-age=0`;
};

const redirectToLogin = () => {
  if (!isBrowser) return;
  // Use pushState so Next.js router picks it up cleanly without full reload
  window.location.href = "/auth/login";
};

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach access token
api.interceptors.request.use(
  (cfg: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && cfg.headers) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefresh } = data.data;
        setTokens(accessToken, newRefresh);
        processQueue(null, accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError, null);
        clearTokens();
        redirectToLogin();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
