import config from "../../config/config";

const BASE_URL = `${config.apiBaseUrl}/studio`;

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
 * Fetch author's active serial works (with draft counts & stats)
 */
async function getMySerials() {
  const response = await fetch(`${BASE_URL}/serials`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch author serials");
  }

  return data.data || [];
}

/**
 * Fetch all chapters for a book (including drafts)
 */
async function getBookChapters(bookId) {
  const response = await fetch(`${BASE_URL}/serials/${bookId}/chapters`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch book chapters");
  }

  return data.data || [];
}

/**
 * Create chapter in studio (draft or published)
 */
async function createChapter(payload) {
  const response = await fetch(`${BASE_URL}/chapters`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create chapter in studio");
  }

  return data.data;
}

/**
 * Update chapter in studio
 */
async function updateChapter(id, payload) {
  const response = await fetch(`${BASE_URL}/chapters/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update chapter");
  }

  return data.data;
}

/**
 * Fetch detailed analytics for a novel
 */
async function getNovelAnalytics(bookId) {
  const response = await fetch(`${BASE_URL}/analytics/${bookId}`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch novel analytics");
  }

  return data.data;
}

/**
 * Toggle channel subscription for persona
 */
async function toggleSubscription(personaId) {
  const response = await fetch(`${BASE_URL}/subscribe/${personaId}`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update subscription");
  }

  return data.data;
}

/**
 * Get persona channel announcements
 */
async function getAnnouncements(handle) {
  const response = await fetch(`${BASE_URL}/announcements/${handle}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch announcements");
  }

  return data.data || [];
}

/**
 * Post persona channel announcement
 */
async function postAnnouncement(payload) {
  const response = await fetch(`${BASE_URL}/announcements`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to post announcement");
  }

  return data.data;
}

/**
 * Get single studio chapter by id
 */
async function getChapterById(id) {
  const response = await fetch(`${BASE_URL}/chapters/${id}`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch chapter");
  }

  return data.data;
}

/**
 * Delete chapter in studio
 */
async function deleteChapter(id) {
  const response = await fetch(`${BASE_URL}/chapters/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete chapter");
  }

  return data.data;
}

/**
 * Fetch volumes for a novel
 */
async function getVolumes(bookId) {
  const response = await fetch(`${config.apiBaseUrl}/volumes/book/${bookId}`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch volumes");
  }

  return data.data || [];
}

/**
 * Create a new volume (arc)
 */
async function createVolume(payload) {
  const response = await fetch(`${config.apiBaseUrl}/volumes`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create volume");
  }

  return data.data;
}

/**
 * Delete a volume
 */
async function deleteVolume(id) {
  const response = await fetch(`${config.apiBaseUrl}/volumes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete volume");
  }

  return data.data;
}

const studioService = {
  getMySerials,
  getBookChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  getVolumes,
  createVolume,
  deleteVolume,
  getNovelAnalytics,
  toggleSubscription,
  getAnnouncements,
  postAnnouncement,
};

export default studioService;
