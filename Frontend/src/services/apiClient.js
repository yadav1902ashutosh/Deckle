import config from "../config/config";
import store from "../store/store";
import { logout } from "../store/authSlice";

const REFRESH_URL = `${config.apiBaseUrl}/users/refresh-token`;

// Singleton in-flight refresh promise mutex to prevent concurrent refresh calls
let refreshPromise = null;

/**
 * Returns standard authentication headers with Bearer token if present
 */
export function getAuthHeaders(isJson = true) {
  const token =
    localStorage.getItem("deckle_token") ||
    localStorage.getItem("deckle-token");
  const headers = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Action executed when the refresh token is expired, invalid, or revoked.
 * Cleans client storage, updates Redux state, and routes to login.
 */
export function handleSessionExpired() {
  localStorage.removeItem("deckle_token");
  localStorage.removeItem("deckle-token");
  localStorage.removeItem("deckle_refresh_token");
  localStorage.removeItem("deckle-refresh-token");

  try {
    store.dispatch(logout());
  } catch (err) {
    console.warn("Redux logout dispatch warning:", err);
  }

  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    // Don't loop redirect if already on /login or /auth
    if (currentPath !== "/login" && currentPath !== "/auth") {
      const fromParam = encodeURIComponent(currentPath + window.location.search);
      window.location.href = `/login?expired=true&from=${fromParam}`;
    }
  }
}

/**
 * Calls backend to exchange the refresh token for a fresh access token (and rotated refresh token)
 */
export async function refreshAccessToken() {
  const refreshToken =
    localStorage.getItem("deckle_refresh_token") ||
    localStorage.getItem("deckle-refresh-token");

  const headers = {
    "Content-Type": "application/json",
  };

  const response = await fetch(REFRESH_URL, {
    method: "POST",
    headers,
    credentials: "include", // Send HTTP-only cookie
    body: JSON.stringify(refreshToken ? { refreshToken } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || "Session expired. Please log in again.";
    throw new Error(errorMsg);
  }

  const { accessToken, refreshToken: newRefreshToken } = data.data || {};

  if (accessToken) {
    localStorage.setItem("deckle_token", accessToken);
  }
  if (newRefreshToken) {
    localStorage.setItem("deckle_refresh_token", newRefreshToken);
  }

  return data.data;
}

/**
 * Smart fetch wrapper that automatically:
 * 1. Attaches Authorization headers and credentials
 * 2. Catches 401 Unauthorized responses
 * 3. Transparently refreshes the access token using in-flight mutex
 * 4. Retries the original request with the renewed token
 * 5. On refresh token expiry, redirects user to login
 */
export async function fetchWithAuth(url, options = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const currentToken =
    localStorage.getItem("deckle_token") ||
    localStorage.getItem("deckle-token");

  const defaultHeaders = {};
  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }
  if (currentToken) {
    defaultHeaders["Authorization"] = `Bearer ${currentToken}`;
  }

  const requestHeaders = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  const requestConfig = {
    ...options,
    headers: requestHeaders,
    credentials: "include",
  };

  let response = await fetch(url, requestConfig);

  // Check if response is 401 Unauthorized and not an auth handshake endpoint
  const isAuthEndpoint =
    url.includes("/users/login") ||
    url.includes("/users/register") ||
    url.includes("/users/refresh-token") ||
    url.includes("/users/refresh");

  if (response.status === 401 && !isAuthEndpoint) {
    try {
      // Use existing singleton in-flight promise if multiple concurrent requests encounter 401
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const refreshedData = await refreshPromise;
      const newToken =
        refreshedData?.accessToken ||
        localStorage.getItem("deckle_token") ||
        localStorage.getItem("deckle-token");

      // Retry the original request with the fresh token
      const retryHeaders = {
        ...requestHeaders,
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
      };

      response = await fetch(url, {
        ...requestConfig,
        headers: retryHeaders,
      });
    } catch (refreshError) {
      // Refresh token is expired, invalid, or revoked: purge session and redirect
      handleSessionExpired();
      throw refreshError;
    }
  }

  return response;
}

export default {
  getAuthHeaders,
  handleSessionExpired,
  refreshAccessToken,
  fetchWithAuth,
};
