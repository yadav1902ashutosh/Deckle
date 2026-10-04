import config from "../../config/config";

const BASE_URL = `${config.apiBaseUrl}/users`;

function getAuthHeaders(isJson = true) {
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
 * 1. Fetch current master user profile + linked personas
 */
async function getCurrentUser() {
  const response = await fetch(`${BASE_URL}/current-user`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch master account");
  }

  return data.data; // { user, personas }
}

/**
 * 2. Update master parent account personal info
 */
async function updateProfile(payload) {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update master account details");
  }

  return data.data;
}

/**
 * 3. Change master account password
 */
async function changePassword({ currentPassword, newPassword }) {
  const response = await fetch(`${BASE_URL}/change-password`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to change password");
  }

  return data.data;
}

/**
 * 4. Revoke all other active sessions
 */
async function revokeOtherSessions() {
  const response = await fetch(`${BASE_URL}/sessions/revoke-others`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to revoke other sessions");
  }

  return data.data;
}

/**
 * 5. Fetch user settings
 */
async function getSettings() {
  const response = await fetch(`${BASE_URL}/settings`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch user settings");
  return data.data;
}

/**
 * 6. Update user settings
 */
async function updateSettings(settings) {
  const response = await fetch(`${BASE_URL}/settings`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify(settings),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update user settings");
  return data.data;
}

/**
 * 7. Fetch 7-day reading velocity
 */
async function getReadingVelocity() {
  const response = await fetch(`${BASE_URL}/reading-velocity`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch reading velocity");
  return data.data || [];
}

/**
 * 8. Fetch genre affinity
 */
async function getGenreAffinity() {
  const response = await fetch(`${BASE_URL}/genre-affinity`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch genre affinity");
  return data.data || [];
}

/**
 * 9. Fetch active sessions list
 */
async function getSessions() {
  const response = await fetch(`${BASE_URL}/sessions`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch active sessions");
  return data.data || [];
}

/**
 * 10. Revoke a single session
 */
async function revokeSession(id) {
  const response = await fetch(`${BASE_URL}/sessions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(true),
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to revoke session");
  return data.data;
}

/**
 * 11. Toggle 2FA
 */
async function toggle2FA(enabled) {
  const response = await fetch(`${BASE_URL}/2fa/toggle`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({ enabled }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update 2FA status");
  return data.data;
}

const userService = {
  getCurrentUser,
  updateProfile,
  changePassword,
  revokeOtherSessions,
  getSettings,
  updateSettings,
  getReadingVelocity,
  getGenreAffinity,
  getSessions,
  revokeSession,
  toggle2FA,
};

export default userService;
