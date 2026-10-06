import config from "../../config/config";
import { fetchWithAuth } from "../apiClient";

const BASE_URL = `${config.apiBaseUrl}/chapters`;

function getAuthHeaders() {
  const token =
    localStorage.getItem("deckle_token") ||
    localStorage.getItem("deckle-token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Fetch table of contents for a novel
 */
async function getNovelTOC(bookId) {
  if (!bookId) return [];
  const response = await fetchWithAuth(`${BASE_URL}/book/${bookId}/toc`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch table of contents");
  }

  return data.data || [];
}

/**
 * Fetch a single chapter with full text content (paragraphs, navigation, reading time)
 */
async function readChapter(bookId, chapterNumber) {
  if (!bookId || !chapterNumber) {
    throw new Error("Book ID and chapter number are required");
  }

  const response = await fetchWithAuth(
    `${BASE_URL}/book/${bookId}/read/${chapterNumber}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch chapter text");
  }

  return data.data;
}

/**
 * Fetch live pulse (4 most recently published chapters)
 */
async function getLivePulse() {
  const response = await fetchWithAuth(`${BASE_URL}/live-pulse`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch live pulse");
  }
  return data.data || [];
}

/**
 * Fetch offline batch chapters for IndexedDB caching
 */
async function getOfflineBatch(bookId, startChapter = 1, limit = 50) {
  const response = await fetchWithAuth(
    `${BASE_URL}/offline-batch/${bookId}?start_chapter=${startChapter}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch offline chapters");
  }
  return data.data || [];
}

/**
 * Publish / create new chapter (Protected)
 */
async function createChapter(chapterPayload) {
  const response = await fetchWithAuth(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(chapterPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create chapter");
  }

  return data.data;
}

const chapterService = {
  getNovelTOC,
  readChapter,
  getLivePulse,
  getOfflineBatch,
  createChapter,
};

export default chapterService;
