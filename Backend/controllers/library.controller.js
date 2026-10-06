import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getPersonaBookshelf,
  getLibraryStats,
  getPersonaReadingHistory,
  updateBookshelfStatus,
  batchRemoveFromBookshelf,
  batchMoveBookshelfFolder,
  clearPersonaReadingHistory,
  getWeeklyReadingGoal,
  upsertReadingProgress,
  getBookProgress,
} from "../model/readingHistory.model.js";
import {
  findPersonaById,
  findPersonasByUserId,
  createPersona,
} from "../model/personas.model.js";
import { getFallbackAvatar } from "../utils/imageReference.js";

// Helper to determine active persona ID for the logged-in user
async function resolveUserPersonaId(req) {
  const reqPersonaId = req.headers["x-persona-id"] || req.query.persona_id || req.body.persona_id;
  if (reqPersonaId) {
    const persona = await findPersonaById(Number(reqPersonaId));
    if (persona && persona.user_id === req.user.id) {
      return persona.id;
    }
  }
  const userPersonas = await findPersonasByUserId(req.user.id);
  if (userPersonas.length > 0) {
    return userPersonas[0].id;
  }
  const cleanUsername = (req.user.username || `reader_${req.user.id}`).replace(/^@/, "").toLowerCase().trim();
  const fallbackPersona = await createPersona({
    user_id: req.user.id,
    display_name: req.user.full_name || req.user.username || "Reader",
    handle: cleanUsername,
    bio: "Welcome to my reading sanctum.",
    avatar_url: req.user.avatar_url || getFallbackAvatar(cleanUsername),
    is_default: true,
  });
  return fallbackPersona.id;
}

// 1. GET BOOKSHELF
export const getBookshelf = asyncHandler(async (req, res) => {
  const personaId = await resolveUserPersonaId(req);
  const { folder } = req.query;
  const bookshelf = await getPersonaBookshelf(personaId, folder);
  return res
    .status(200)
    .json(new ApiResponse(200, bookshelf, "Bookshelf fetched successfully!"));
});

// 2. TOGGLE OR UPDATE BOOKSHELF ITEM
export const toggleBookshelf = asyncHandler(async (req, res) => {
  const personaId = await resolveUserPersonaId(req);
  const { book_id, is_bookmarked, folder, is_favorite } = req.body;

  if (!book_id) {
    throw new ApiError(400, "book_id is required");
  }

  const updated = await updateBookshelfStatus({
    persona_id: personaId,
    book_id: Number(book_id),
    is_bookmarked: is_bookmarked !== undefined ? is_bookmarked : true,
    folder: folder || "Reading",
    is_favorite: Boolean(is_favorite),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Bookshelf updated successfully!"));
});

// 3. BATCH REMOVE ITEMS
export const batchRemoveBooks = asyncHandler(async (req, res) => {
  const personaId = await resolveUserPersonaId(req);
  const { book_ids } = req.body;

  if (!Array.isArray(book_ids) || book_ids.length === 0) {
    throw new ApiError(400, "book_ids array is required");
  }

  const result = await batchRemoveFromBookshelf(personaId, book_ids);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Novels removed from shelf successfully!"));
});

// 4. BATCH MOVE ITEMS
export const batchMoveBooks = asyncHandler(async (req, res) => {
  const personaId = await resolveUserPersonaId(req);
  const { book_ids, folder } = req.body;

  if (!Array.isArray(book_ids) || book_ids.length === 0 || !folder) {
    throw new ApiError(400, "book_ids array and destination folder are required");
  }

  const result = await batchMoveBookshelfFolder(personaId, book_ids, folder);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Novels moved successfully!"));
});

// 5. GET LIBRARY STATS & ACTIVE SPOTLIGHT
export const getLibraryOverviewStats = asyncHandler(async (req, res) => {
  const personaId = await resolveUserPersonaId(req);
  const stats = await getLibraryStats(personaId);
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Library stats fetched successfully!"));
});

// 6. GET READING HISTORY
export const getReadingHistory = asyncHandler(async (req, res) => {
  const personaId = await resolveUserPersonaId(req);
  const { limit = 20 } = req.query;
  const history = await getPersonaReadingHistory(personaId, Number(limit));
  return res
    .status(200)
    .json(new ApiResponse(200, history, "Reading history fetched successfully!"));
});

// 7. RECORD READING PROGRESS / SYNC POSITION
export const recordProgress = asyncHandler(async (req, res) => {
  const personaId = await resolveUserPersonaId(req);
  const { book_id, chapter_id, chapter_number, scroll_percentage, words_count } = req.body;

  if (!book_id) {
    throw new ApiError(400, "book_id is required");
  }

  const updated = await upsertReadingProgress({
    persona_id: personaId,
    user_id: req.user.id,
    book_id: Number(book_id),
    chapter_id: chapter_id ? Number(chapter_id) : null,
    chapter_number: Number(chapter_number) || 1,
    scroll_percentage: parseFloat(scroll_percentage) || 0.0,
    words_count: Number(words_count) || 0,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Reading progress synchronized!"));
});

// 8. CLEAR READING HISTORY
export const clearReadingHistory = asyncHandler(async (req, res) => {
  const personaId = await resolveUserPersonaId(req);
  await clearPersonaReadingHistory(personaId);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Reading history cleared successfully!"));
});

// 9. GET WEEKLY READING GOAL ROLLUP
export const getWeeklyGoal = asyncHandler(async (req, res) => {
  const goal = await getWeeklyReadingGoal(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, goal, "Weekly reading goal fetched successfully!"));
});

// 10. CHECK BOOKSHELF STATUS FOR A SINGLE BOOK
export const getBookLibraryStatus = asyncHandler(async (req, res) => {
  const personaId = await resolveUserPersonaId(req);
  const { bookId } = req.params;
  const progress = await getBookProgress(personaId, Number(bookId));
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        book_id: Number(bookId),
        is_bookmarked: Boolean(progress?.is_bookmarked),
        folder: progress?.folder || "Reading",
        is_favorite: Boolean(progress?.is_favorite),
        last_chapter_number: progress?.last_chapter_number || 1,
        scroll_percentage: progress?.scroll_percentage || 0,
      },
      "Book library status fetched successfully!"
    )
  );
});
