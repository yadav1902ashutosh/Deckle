import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getAllGenres,
  getGenreBySlug,
  createGenre,
} from "../model/genres.model.js";

// 1. GET ALL ACTIVE GENRES (Public - Catalog / Sidebar)
export const getGenresList = asyncHandler(async (req, res) => {
  const genres = await getAllGenres();
  return res
    .status(200)
    .json(new ApiResponse(200, genres, "Genres fetched successfully!"));
});

// 2. GET GENRE DETAILS BY SLUG (Public)
export const getGenreDetails = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const genre = await getGenreBySlug(slug.toLowerCase().trim());

  if (!genre) {
    throw new ApiError(404, `Genre '${slug}' not found!`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, genre, "Genre details fetched successfully!"));
});

// 3. CREATE A NEW GENRE (Protected)
export const createNewGenre = asyncHandler(async (req, res) => {
  const { name, slug, description, icon, display_order } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    throw new ApiError(400, "Genre name and unique slug are required!");
  }

  const cleanSlug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const newGenre = await createGenre({
    name: name.trim(),
    slug: cleanSlug,
    description: description?.trim() || null,
    icon: icon?.trim() || null,
    display_order: Number(display_order) || 0,
    is_active: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newGenre, "Genre created successfully!"));
});
