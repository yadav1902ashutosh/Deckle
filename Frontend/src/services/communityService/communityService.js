import config from "../../config/config";
import { fetchWithAuth } from "../apiClient";

const BASE_URL = `${config.apiBaseUrl}/community`;

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
 * Fetch forum discussions feed
 */
async function getThreads(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "all") query.set("category", params.category);
  if (params.book_id) query.set("book_id", params.book_id);
  if (params.limit) query.set("limit", params.limit);

  const queryString = query.toString();
  const url = queryString ? `${BASE_URL}/threads?${queryString}` : `${BASE_URL}/threads`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch forum discussions");
  }

  return data.data || [];
}

/**
 * Start new discourse thread (Protected)
 */
async function createThread(payload) {
  const response = await fetchWithAuth(`${BASE_URL}/threads`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to post thread");
  }

  return data.data;
}

/**
 * Upvote a thread (Protected)
 */
async function upvoteThread(threadId) {
  const response = await fetchWithAuth(`${BASE_URL}/threads/${threadId}/upvote`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to upvote thread");
  }

  return data.data;
}

/**
 * Fetch top scholars leaderboard
 */
async function getTopScholars() {
  const response = await fetchWithAuth(`${BASE_URL}/top-scholars`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch top scholars");
  }

  return data.data || [];
}

/**
 * Fetch a single discussion thread by ID
 */
async function getThreadById(threadId) {
  const response = await fetchWithAuth(`${BASE_URL}/threads/${threadId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch thread");
  }

  return data.data;
}

/**
 * Fetch thread replies
 */
async function getThreadReplies(threadId) {
  const response = await fetchWithAuth(`${BASE_URL}/threads/${threadId}/replies`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch thread replies");
  }

  return data.data || [];
}

/**
 * Post a reply to a thread (Protected)
 */
async function postReply(threadId, payload) {
  const response = await fetchWithAuth(`${BASE_URL}/threads/${threadId}/replies`, {
    method: "POST",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to post reply");
  }

  return data.data;
}

const communityService = {
  getThreads,
  getThreadById,
  getThreadReplies,
  postReply,
  createThread,
  upvoteThread,
  getTopScholars,
};

export default communityService;
