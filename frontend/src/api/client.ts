import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ─── Keep Render free tier awake (ping every 10 minutes) ─────────────
const pingBackend = () => {
  axios.get(`${API_BASE_URL}/actuator/health`, { timeout: 10000 }).catch(() => {});
};
// Ping immediately on app load, then every 10 minutes
pingBackend();
setInterval(pingBackend, 10 * 60 * 1000);

// ─── Axios Instance ──────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90s — allows for Render free tier cold-start (up to 60s)
});

// ─── Request Interceptor: inject access token ────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: token refresh on 401 ──────────────────────
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setTokens(accessToken, newRefreshToken);

        refreshSubscribers.forEach((cb) => cb(accessToken));
        refreshSubscribers = [];

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Token Storage (in-memory + sessionStorage for persistence) ───────
let accessTokenMemory: string | null = null;

export const getAccessToken = (): string | null => {
  return accessTokenMemory || sessionStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  accessTokenMemory = accessToken;
  sessionStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearTokens = (): void => {
  accessTokenMemory = null;
  sessionStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export default apiClient;
