import config from "../../config/config";
import { fetchWithAuth } from "../apiClient";

// BASE_URL = "http://localhost:8000/api/v1/personas"
const BASE_URL = `${config.apiBaseUrl}/personas`;

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
 * 1. Fetch all personas owned by the logged-in user
 */
async function getMyPersonas() {
  const response = await fetchWithAuth(`${BASE_URL}/my`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user personas");
  }

  return data.data; // array of personas
}

/**
 * 2. Fetch public author / persona profile by handle (with their published books)
 */
async function getPublicPersonaProfile(handle) {
  const cleanHandle = handle.replace(/^@/, "");
  const response = await fetchWithAuth(`${BASE_URL}/${encodeURIComponent(cleanHandle)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `No author found with handle @${cleanHandle}`);
  }

  return data.data; // { persona, books }
}

/**
 * 3. Update reading preferences (theme, font, fontSize, lineHeight, favorite_genres)
 */
async function updatePreferences(personaId, preferences) {
  if (!personaId) {
    throw new Error("Persona ID is required to update preferences");
  }

  const response = await fetchWithAuth(`${BASE_URL}/${personaId}/preferences`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({ preferences }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update preferences");
  }

  return data.data; // updated persona
}

/**
 * 4. Increment reading stats (words read and streak tracking)
 */
async function incrementStats(personaId, wordsCount = 0) {
  if (!personaId) {
    throw new Error("Persona ID is required to increment stats");
  }

  const response = await fetchWithAuth(`${BASE_URL}/${personaId}/stats/increment`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({ wordsCount }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to increment reading stats");
  }

  return data.data; // updated reading stats
}

/**
 * 5. Create a new pen name / persona (supports JSON or FormData with avatar/banner)
 */
async function createPersona(personaPayload) {
  const isFormData = personaPayload instanceof FormData;

  const response = await fetchWithAuth(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(!isFormData),
    credentials: "include",
    body: isFormData ? personaPayload : JSON.stringify(personaPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create new pen name");
  }

  return data.data; // created persona
}

/**
 * 6. Soft-delete a persona (cannot delete default primary persona)
 */
async function deletePersona(personaId) {
  const response = await fetchWithAuth(`${BASE_URL}/${personaId}`, {
    method: "DELETE",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete persona");
  }

  return data.data;
}

const personaService = {
  getMyPersonas,
  getPublicPersonaProfile,
  updatePreferences,
  incrementStats,
  createPersona,
  deletePersona,
};

export default personaService;
