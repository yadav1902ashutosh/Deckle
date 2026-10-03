import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  upsertReadingProgress,
  updateBookshelfStatus,
  getPersonaBookshelf,
  getPersonaReadingHistory,
  getBookProgress,
} from "../model/readingHistory.model.js";
import { findPersonaById, findPersonasByUserId } from "../model/personas.model.js";
import { findBookById } from "../model/books.model.js";

// Helper: resolve and verify that the persona belongs to the logged-in user
async function resolveUserPersona(reqPersonaId, userId) {
  if (reqPersonaId) {
    const persona = await findPersonaById(Number(reqPersonaId));
    if (!persona || persona.user_id !== userId) {
      throw new ApiError(403, "Forbidden: You do not own this persona!");
    }
    return persona.id;
  }

  // Fallback to user's default persona
  const personas = await findPersonasByUserId(userId);
  if (!personas || personas.length === 0) {
    throw new ApiError(404, "No persona found for this user account!");
  }
  const defaultPersona = personas.find((p) => p.is_default) || personas[0];
  return defaultPersona.id;
}

// 1. SYNC READING PROGRESS (Auto-syncs chapter & scroll %)
export const syncReadingProgress = asyncHandler(async (req, res) => {
  const { book_id, chapter_id, chapter_number, scroll_percentage, persona_id } =
    req.body;

  if (!book_id) {
    throw new ApiError(400, "book_id is required to record reading progress!");
  }

  // Verify book exists
  const book = await findBookById(Number(book_id));
  if (!book) {
    throw new ApiError(404, "Novel not found!");
  }

  const activePersonaId = await resolveUserPersona(persona_id, req.user.id);

  const progress = await upsertReadingProgress({
    persona_id: activePersonaId,
    book_id: Number(book_id),
    chapter_id: chapter_id ? Number(chapter_id) : null,
    chapter_number: chapter_number ? Number(chapter_number) : 1,
    scroll_percentage: scroll_percentage ? parseFloat(scroll_percentage) : 0.0,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, progress, "Reading progress synced successfully!"));
});

// 2. UPDATE BOOKSHELF / BOOKMARK STATUS
export const updateBookshelf = asyncHandler(async (req, res) => {
  const { book_id, is_bookmarked, folder, is_favorite, persona_id } = req.body;

  if (!book_id) {
    throw new ApiError(400, "book_id is required!");
  }

  const book = await findBookById(Number(book_id));
  if (!book) {
    throw new ApiError(404, "Novel not found!");
  }

  const activePersonaId = await resolveUserPersona(persona_id, req.user.id);

  const shelfItem = await updateBookshelfStatus({
    persona_id: activePersonaId,
    book_id: Number(book_id),
    is_bookmarked: is_bookmarked !== undefined ? Boolean(is_bookmarked) : true,
    folder: folder || "Reading",
    is_favorite: Boolean(is_favorite),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, shelfItem, "Bookshelf updated successfully!"));
});

// 3. GET READER BOOKSHELF (Reading, Completed, Plan to Read, etc.)
export const getBookshelf = asyncHandler(async (req, res) => {
  const { folder, persona_id } = req.query;

  const activePersonaId = await resolveUserPersona(persona_id, req.user.id);
  const bookshelf = await getPersonaBookshelf(activePersonaId, folder || null);

  return res
    .status(200)
    .json(new ApiResponse(200, bookshelf, "Bookshelf fetched successfully!"));
});

// 4. GET RECENT READING HISTORY FEED
export const getReadingHistory = asyncHandler(async (req, res) => {
  const { limit, persona_id } = req.query;

  const activePersonaId = await resolveUserPersona(persona_id, req.user.id);
  const history = await getPersonaReadingHistory(
    activePersonaId,
    limit ? Number(limit) : 20
  );

  return res
    .status(200)
    .json(new ApiResponse(200, history, "Reading history fetched successfully!"));
});

// 5. GET PROGRESS FOR A SPECIFIC BOOK
export const getSingleBookProgress = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { persona_id } = req.query;

  const activePersonaId = await resolveUserPersona(persona_id, req.user.id);
  const progress = await getBookProgress(activePersonaId, Number(bookId));

  return res
    .status(200)
    .json(new ApiResponse(200, progress, "Book progress fetched successfully!"));
});
