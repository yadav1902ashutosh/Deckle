import config from "../../config/config";

const BASE_URL = `${config.apiBaseUrl}/genres`;

/**
 * Fetch all platform genres from backend
 */
async function getGenres() {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch genres");
  }

  return data.data; // array of genres
}

const genreService = {
  getGenres,
};

export default genreService;
