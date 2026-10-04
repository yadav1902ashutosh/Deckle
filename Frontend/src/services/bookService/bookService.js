import config from "../../config/config";

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
  if (params.page) {
    query.set("page", params.page);
  }
  if (params.limit) {
    query.set("limit", params.limit);
  }

  const queryString = query.toString();
  const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch books catalog");
  }

  return data.data; // array of books
}

/**
 * 2. Fetch single novel details by slug
 */
async function getBookBySlug(slug) {
  if (!slug) {
    throw new Error("Book slug is required");
  }

  const cleanSlug = encodeURIComponent(slug.trim().toLowerCase());
  const response = await fetch(`${BASE_URL}/${cleanSlug}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Book '${slug}' not found`);
  }

  return data.data; // book object with author and genre joins
}

/**
 * 3. Publish a new novel (Protected - author persona required)
 */
async function createBook(payload) {
  const isFormData = payload instanceof FormData;

  const response = await fetch(BASE_URL, {
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
 * 4. Soft delete a novel (Protected - persona owner required)
 */
async function deleteBook(id, personaId) {
  const response = await fetch(`${BASE_URL}/${id}`, {
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
  getBookBySlug,
  createBook,
  deleteBook,
};

export default bookService;
