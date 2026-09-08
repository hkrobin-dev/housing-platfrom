import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try a single silent refresh using the stored refresh token, then retry once.
let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) return Promise.reject(error);

      original._retry = true;

      if (isRefreshing) {
        // Wait for the in-flight refresh to finish, then retry
        await new Promise<void>((resolve) => pendingQueue.push(resolve));
        return api(original);
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data;
        Cookies.set("accessToken", accessToken, { expires: 1 });
        Cookies.set("refreshToken", newRefresh, { expires: 7 });
        pendingQueue.forEach((resolve) => resolve());
        pendingQueue = [];
        return api(original);
      } catch (refreshErr) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/** Extracts a friendly message from a failed API call for toast/error display. */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string })?.message || err.message || "Something went wrong";
  }
  return err instanceof Error ? err.message : "Something went wrong";
}
