import config from "../../config/config";

const BASE_URL = `${config.apiBaseUrl}/history`;

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
 * Fetch reader's bookshelf (e.g. 'Reading', 'Completed', 'Plan to Read')
 */
async function getBookshelf(folder = null) {
  const url = folder
    ? `${BASE_URL}/shelf?folder=${encodeURIComponent(folder)}`
    : `${BASE_URL}/shelf`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch bookshelf");
  }

  return data.data || [];
}

/**
 * Fetch recent reading history activity
 */
async function getRecentHistory() {
  const response = await fetch(`${BASE_URL}/recent`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch reading history");
  }

  return data.data || [];
}

/**
 * Sync reading progress (auto-syncs chapter & scroll %)
 */
async function syncProgress({
  book_id,
  chapter_id,
  chapter_number,
  scroll_percentage,
  persona_id,
}) {
  const response = await fetch(`${BASE_URL}/progress`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({
      book_id,
      chapter_id,
      chapter_number,
      scroll_percentage,
      persona_id,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to sync reading progress");
  }

  return data.data;
}

/**
 * Add / update bookshelf bookmark
 */
async function updateBookshelf({
  persona_id,
  book_id,
  is_bookmarked = true,
  folder = "Reading",
  is_favorite = false,
}) {
  const response = await fetch(`${BASE_URL}/shelf`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({
      persona_id,
      book_id,
      is_bookmarked,
      folder,
      is_favorite,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update bookshelf");
  }

  return data.data;
}

const readingHistoryService = {
  getBookshelf,
  getRecentHistory,
  syncProgress,
  updateBookshelf,
};

export default readingHistoryService;
