import config from "../../config/config";
import { fetchWithAuth } from "../apiClient";

const BASE_URL = `${config.apiBaseUrl}/books`;

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
 * 1. Fetch active serial books catalog feed
 * Supports optional client query parameters for genre, status, sort, page, and limit
 */
async function getBooks(params = {}) {
  const query = new URLSearchParams();

  if (params.genre && params.genre !== "all") {
    query.set("genre", params.genre);
  }
  if (params.status && params.status !== "Any") {
    query.set("status", params.status.toLowerCase());
  }
  if (params.sort) {
    query.set("sort", params.sort);
  }
  if (params.min_words) {
    query.set("min_words", params.min_words);
  }
  if (params.max_words) {
    query.set("max_words", params.max_words);
  }
  if (params.page) {
    query.set("page", params.page);
  }
  if (params.limit) {
    query.set("limit", params.limit);
  }

  const queryString = query.toString();
  const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch books catalog");
  }

  // Returns { books, pagination } or books array
  return data.data;
}

/**
 * 2. Fetch featured editorial spotlight books
 */
async function getFeaturedBooks(limit = 20) {
  const response = await fetchWithAuth(`${BASE_URL}/featured?limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch featured books");
  }
  return data.data;
}

/**
 * 3. Fetch power rankings leaderboard
 */
async function getRankings(params = {}) {
  const query = new URLSearchParams();
  if (params.timeframe) query.set("timeframe", params.timeframe);
  if (params.limit) query.set("limit", params.limit);

  const queryString = query.toString();
  const url = queryString ? `${BASE_URL}/rankings?${queryString}` : `${BASE_URL}/rankings`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch rankings");
  }
  return data.data;
}

/**
 * 4. Fetch trending tags / motifs
 */
async function getTrendingTags() {
  const response = await fetchWithAuth(`${BASE_URL}/trending-tags`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch trending tags");
  }
  return data.data;
}

/**
 * 5. Fetch active genres with novel counts
 */
async function getGenres() {
  const response = await fetchWithAuth(`${BASE_URL}/genres`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch genres");
  }
  return data.data;
}

/**
 * 6. Search books catalog (Command Palette)
 */
async function searchBooks(query) {
  if (!query || !query.trim()) return [];
  const response = await fetchWithAuth(`${BASE_URL}/search?q=${encodeURIComponent(query.trim())}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to search books");
  }
  return data.data;
}

/**
 * 7. Fetch single novel details by slug
 */
async function getBookBySlug(slug) {
  if (!slug) {
    throw new Error("Book slug is required");
  }

  const cleanSlug = encodeURIComponent(slug.trim().toLowerCase());
  const response = await fetchWithAuth(`${BASE_URL}/${cleanSlug}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Book '${slug}' not found`);
  }

  return data.data;
}

/**
 * 8. Fetch recommendations for a novel
 */
async function getRecommendations(slug) {
  if (!slug) return [];
  const cleanSlug = encodeURIComponent(slug.trim().toLowerCase());
  const response = await fetchWithAuth(`${BASE_URL}/${cleanSlug}/recommendations`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch recommendations");
  }
  return data.data;
}

/**
 * 9. Vote power stone for a novel
 */
async function votePowerStone(slug) {
  if (!slug) throw new Error("Slug is required");
  const cleanSlug = encodeURIComponent(slug.trim().toLowerCase());
  const response = await fetchWithAuth(`${BASE_URL}/${cleanSlug}/power-stones`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to cast power stone");
  }
  return data.data;
}

/**
 * 10. Publish a new novel (Protected - author persona required)
 */
async function createBook(payload) {
  const isFormData = payload instanceof FormData;

  const response = await fetchWithAuth(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(!isFormData),
    credentials: "include",
    body: isFormData ? payload : JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to publish book");
  }

  return data.data;
}

/**
 * 11. Soft delete a novel (Protected - persona owner required)
 */
async function deleteBook(id, personaId) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({ persona_id: personaId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete book");
  }

  return data.data;
}

const bookService = {
  getBooks,
  getFeaturedBooks,
  getRankings,
  getTrendingTags,
  getGenres,
  searchBooks,
  getBookBySlug,
  getRecommendations,
  votePowerStone,
  createBook,
  deleteBook,
};

export default bookService;
