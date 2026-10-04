import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getAuthorSerials,
  getBookStudioAnalytics,
  togglePersonaSubscription,
  getPersonaAnnouncements,
  createPersonaAnnouncement,
} from "../model/studio.model.js";
import {
  createChapter,
  updateChapterById,
  getAllChaptersForAuthor,
  findChapterById,
  softDeleteChapter,
} from "../model/chapters.model.js";
import { findBookById } from "../model/books.model.js";
import { findPersonaById } from "../model/personas.model.js";

// 1. GET ALL AUTHOR SERIALS (Studio Dashboard)
export const getMySerials = asyncHandler(async (req, res) => {
  const serials = await getAuthorSerials(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, serials, "Author serials fetched successfully!"));
});

// 2. GET SERIAL CHAPTERS (Author View including drafts & scheduled)
export const getAuthorBookChapters = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const book = await findBookById(bookId);
  if (!book) {
    throw new ApiError(404, "Novel not found");
  }

  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this novel");
  }

  const chapters = await getAllChaptersForAuthor(Number(bookId));
  return res
    .status(200)
    .json(new ApiResponse(200, chapters, "Chapters fetched successfully!"));
});

// 3. GET SINGLE STUDIO CHAPTER
export const getStudioChapterById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const chapter = await findChapterById(Number(id));
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  const book = await findBookById(chapter.book_id);
  if (!book) {
    throw new ApiError(404, "Novel not found");
  }

  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this novel");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chapter, "Chapter fetched successfully!"));
});

// 4. CREATE STUDIO CHAPTER (Draft, Scheduled, or Publish)
export const createStudioChapter = asyncHandler(async (req, res) => {
  const { book_id, volume_id, chapter_number, title, content, status, scheduled_at } = req.body;

  if (!book_id || !title?.trim() || !content?.trim()) {
    throw new ApiError(400, "book_id, title, and content are required");
  }

  const book = await findBookById(Number(book_id));
  if (!book) {
    throw new ApiError(404, "Novel not found");
  }

  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this novel");
  }

  const words_count = content.trim().split(/\s+/).filter(Boolean).length;

  const chapter = await createChapter({
    book_id: Number(book_id),
    volume_id: volume_id ? Number(volume_id) : null,
    chapter_number:
      chapter_number !== undefined && chapter_number !== null && chapter_number !== ""
        ? Number(chapter_number)
        : undefined,
    title: title.trim(),
    content: content.trim(),
    words_count,
    status: status || "draft",
    scheduled_at: scheduled_at || null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, chapter, "Chapter created in studio successfully!"));
});

// 5. UPDATE STUDIO CHAPTER
export const updateStudioChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { book_id, title, content, status, volume_id, scheduled_at, chapter_number } = req.body;

  let targetBookId = book_id;
  if (!targetBookId) {
    const existing = await findChapterById(Number(id));
    if (!existing) {
      throw new ApiError(404, "Chapter not found");
    }
    targetBookId = existing.book_id;
  }

  const book = await findBookById(Number(targetBookId));
  if (!book) {
    throw new ApiError(404, "Novel not found");
  }

  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this novel");
  }

  const updated = await updateChapterById(Number(id), Number(targetBookId), {
    title,
    content,
    status,
    volume_id,
    scheduled_at,
    chapter_number,
  });

  if (!updated) {
    throw new ApiError(404, "Chapter not found or could not be updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Chapter updated successfully!"));
});

// 6. DELETE STUDIO CHAPTER
export const deleteStudioChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const chapter = await findChapterById(Number(id));
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  const book = await findBookById(chapter.book_id);
  if (!book) {
    throw new ApiError(404, "Novel not found");
  }

  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this novel");
  }

  const deleted = await softDeleteChapter(Number(id), chapter.book_id);
  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Chapter deleted successfully!"));
});

// 5. GET STUDIO ANALYTICS FOR NOVEL OR AUTHOR
export const getNovelAnalytics = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!bookId) {
    const serials = await getAuthorSerials(req.user.id);
    if (serials.length === 0) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            novel: null,
            readers: { total_readers: 0, active_readers: 0, favorites: 0 },
            weekly_activity: [],
          },
          "No serials to analyze"
        )
      );
    }
    const analytics = await getBookStudioAnalytics(serials[0].id, req.user.id);
    return res
      .status(200)
      .json(new ApiResponse(200, analytics, "Novel analytics fetched successfully!"));
  }

  const analytics = await getBookStudioAnalytics(Number(bookId), req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Novel analytics fetched successfully!"));
});

// 6. TOGGLE CHANNEL SUBSCRIPTION
export const toggleChannelSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await togglePersonaSubscription(Number(id), req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Channel subscription updated!"));
});

// 7. GET CHANNEL ANNOUNCEMENTS
export const getChannelAnnouncements = asyncHandler(async (req, res) => {
  const { handle } = req.params;
  const announcements = await getPersonaAnnouncements(handle);
  return res
    .status(200)
    .json(new ApiResponse(200, announcements, "Announcements fetched successfully!"));
});

// 8. POST CHANNEL ANNOUNCEMENT
export const postChannelAnnouncement = asyncHandler(async (req, res) => {
  const { persona_id, title, content } = req.body;
  if (!persona_id || !title?.trim() || !content?.trim()) {
    throw new ApiError(400, "persona_id, title, and content are required");
  }

  const created = await createPersonaAnnouncement(Number(persona_id), req.user.id, {
    title: title.trim(),
    content: content.trim(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, created, "Channel announcement posted!"));
});
