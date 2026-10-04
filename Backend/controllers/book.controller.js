import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createBook,
  findActiveBooksPaginated,
  findFeaturedBooks,
  findRankings,
  findTrendingTags,
  findGenresWithCounts,
  findBookBySlug,
  findBookRecommendations,
  castPowerStoneVote,
  searchBooks,
  softDeleteBook,
} from "../model/books.model.js";
import { findPersonaById } from "../model/personas.model.js";
import { promoteUserToWriter } from "../model/users.model.js";
import { getFallbackBookCover } from "../utils/imageReference.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// 1. PUBLISH A NEW NOVEL
export const createNewBook = asyncHandler(async (req, res) => {
  const { title, slug, description, cover_image, persona_id, genre_id, status, tags } =
    req.body;

  // Validation
  if (!title?.trim() || !slug?.trim() || !persona_id) {
    throw new ApiError(400, "Title, slug, and persona_id are required!");
  }

  // Format slug cleanly
  const cleanSlug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // CRITICAL SECURITY CHECK: Does the logged-in user own this persona?
  const persona = await findPersonaById(Number(persona_id));
  if (!persona) {
    throw new ApiError(404, "The specified persona does not exist!");
  }
  if (persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this pen name!");
  }

  // Parse tags (handles JSON string, comma string, or array from multipart forms)
  let parsedTags = [];
  if (Array.isArray(tags)) {
    parsedTags = tags;
  } else if (typeof tags === "string") {
    try {
      parsedTags = JSON.parse(tags);
    } catch {
      parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }

  // Image Upload: check if file was uploaded via Multer
  let finalCoverImage = cover_image?.trim() || null;
  const coverLocalPath = req.file?.path;

  if (coverLocalPath) {
    const uploadResult = await uploadOnCloudinary(coverLocalPath, "deckle_books");
    if (uploadResult?.secure_url) {
      finalCoverImage = uploadResult.secure_url;
    }
  }

  // Fallback to reliable reference cover if no image provided
  if (!finalCoverImage) {
    finalCoverImage = getFallbackBookCover(cleanSlug, parsedTags);
  }

  // Create novel in Neon DB
  const newBook = await createBook({
    title: title.trim(),
    slug: cleanSlug,
    description: description?.trim() || null,
    cover_image: finalCoverImage,
    persona_id: Number(persona_id),
    genre_id: genre_id ? Number(genre_id) : null,
    status: status || "ongoing",
    tags: parsedTags,
  });

  // System-defined role promotion: if user is currently a 'reader', automatically promote to 'writer'
  if (req.user?.role === "reader") {
    await promoteUserToWriter(req.user.id);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newBook, "Novel published successfully!"));
});

// 2. GET ACTIVE NOVELS (Paginated Catalog Feed with Facet Filters)
export const getActiveBooksFeed = asyncHandler(async (req, res) => {
  const { genre, status, sort, min_words, max_words, page, limit } = req.query;

  const result = await findActiveBooksPaginated({
    genre: genre && genre !== "all" ? genre : null,
    status: status && status !== "Any" ? status.toLowerCase() : null,
    sort: sort || "popular",
    min_words: min_words ? parseInt(min_words, 10) : null,
    max_words: max_words ? parseInt(max_words, 10) : null,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Books catalog fetched successfully!"));
});

// 3. GET FEATURED EDITORIAL NOVELS
export const getFeaturedBooks = asyncHandler(async (req, res) => {
  const featured = await findFeaturedBooks();
  return res
    .status(200)
    .json(new ApiResponse(200, featured, "Featured serials fetched successfully!"));
});

// 4. GET POWER RANKINGS
export const getRankings = asyncHandler(async (req, res) => {
  const { timeframe, limit } = req.query;
  const rankings = await findRankings({ timeframe, limit });
  return res
    .status(200)
    .json(new ApiResponse(200, rankings, "Leaderboard rankings fetched successfully!"));
});

// 5. GET TRENDING TAGS / MOTIFS
export const getTrendingTags = asyncHandler(async (req, res) => {
  const tags = await findTrendingTags();
  return res
    .status(200)
    .json(new ApiResponse(200, tags, "Trending motifs fetched successfully!"));
});

// 6. GET ACTIVE GENRES WITH COUNTS
export const getGenresList = asyncHandler(async (req, res) => {
  const genres = await findGenresWithCounts();
  return res
    .status(200)
    .json(new ApiResponse(200, genres, "Genres list fetched successfully!"));
});

// 7. SEARCH NOVELS (For Command Palette & Navbar Search)
export const searchBooksCatalog = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.status(200).json(new ApiResponse(200, [], "Search results"));
  }
  const results = await searchBooks(q);
  return res
    .status(200)
    .json(new ApiResponse(200, results, "Search results fetched successfully!"));
});

// 8. GET NOVEL DETAILS BY SLUG
export const getBookDetails = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const currentUserId = req.user?.id || null;
  const book = await findBookBySlug(slug.toLowerCase().trim(), currentUserId);
  if (!book) {
    throw new ApiError(404, "Novel not found!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, book, "Novel details fetched successfully!"));
});

// 9. GET NOVEL RECOMMENDATIONS
export const getBookRecommendations = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const recs = await findBookRecommendations(slug.toLowerCase().trim());
  return res
    .status(200)
    .json(new ApiResponse(200, recs, "Recommendations fetched successfully!"));
});

// 10. CAST POWER STONE VOTE
export const votePowerStone = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const newCount = await castPowerStoneVote(slug.toLowerCase().trim(), req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { power_stones_count: newCount }, "Power stone cast successfully!"));
});

// 11. SOFT DELETE A NOVEL
export const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { persona_id } = req.body;
  if (!persona_id) {
    throw new ApiError(400, "persona_id is required to delete a book!");
  }
  // Verify persona ownership
  const persona = await findPersonaById(persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this pen name!");
  }
  const deletedBook = await softDeleteBook(Number(id), persona_id);
  if (!deletedBook) {
    throw new ApiError(404, "Book not found or already deleted!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedBook, "Novel deleted successfully!"));
});
