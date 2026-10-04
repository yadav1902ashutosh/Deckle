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

const userService = {
  getCurrentUser,
  updateProfile,
  changePassword,
  revokeOtherSessions,
};

export default userService;
