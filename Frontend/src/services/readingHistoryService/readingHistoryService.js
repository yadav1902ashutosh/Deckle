import config from "../../config/config";

const BASE_URL = `${config.apiBaseUrl}/library`;

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
 * Fetch reader's bookshelf (e.g. 'all', 'reading', 'completed', 'plan_to_read')
 */
async function getBookshelf(folder = null) {
  const url = folder && folder !== "all"
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
 * Fetch library overview stats & active reading hero
 */
async function getLibraryStats() {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch library stats");
  }

  return data.data || { stats: {}, active_reading: null };
}

/**
 * Fetch recent reading history activity
 */
async function getRecentHistory(limit = 20) {
  const response = await fetch(`${BASE_URL}/history?limit=${limit}`, {
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
 * Clear reading history
 */
async function clearHistory() {
  const response = await fetch(`${BASE_URL}/history`, {
    method: "DELETE",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to clear reading history");
  }

  return data.data;
}

/**
 * Sync reading progress (auto-syncs chapter & scroll %)
 */
async function syncProgress({
  book_id,
  chapter_id,
  chapter_number,
  scroll_percentage,
  words_count = 0,
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
      words_count,
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

/**
 * Batch remove novels from shelf
 */
async function batchRemove(bookIds = []) {
  const response = await fetch(`${BASE_URL}/shelf/batch-remove`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({ book_ids: bookIds }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove novels from shelf");
  }

  return data.data;
}

/**
 * Batch move novels to folder
 */
async function batchMove(bookIds = [], folder) {
  const response = await fetch(`${BASE_URL}/shelf/batch-move`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({ book_ids: bookIds, folder }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to move novels");
  }

  return data.data;
}

/**
 * Fetch 7-day weekly reading goal
 */
async function getWeeklyReadingGoal() {
  const response = await fetch(`${BASE_URL}/weekly-goal`, {
    method: "GET",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch weekly reading goal");
  }

  return data.data;
}

const readingHistoryService = {
  getBookshelf,
  getLibraryStats,
  getRecentHistory,
  clearHistory,
  syncProgress,
  updateBookshelf,
  batchRemove,
  batchMove,
  getWeeklyReadingGoal,
};

export default readingHistoryService;
