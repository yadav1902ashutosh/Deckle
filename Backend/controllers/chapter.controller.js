import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createChapter,
  getTableOfContents,
  getChapterByNumber,
  findLivePulseChapters,
  findOfflineBatchChapters,
  softDeleteChapter,
} from "../model/chapters.model.js";
import { findBookById } from "../model/books.model.js";
import { findPersonaById } from "../model/personas.model.js";
import { findVolumeById } from "../model/volumes.model.js";

// 1. ADD A NEW CHAPTER TO A NOVEL
export const createNewChapter = asyncHandler(async (req, res) => {
  const { book_id, volume_id, chapter_number, title, content, status } = req.body;

  // Validation
  if (!book_id || !chapter_number || !title?.trim() || !content?.trim()) {
    throw new ApiError(
      400,
      "book_id, chapter_number, title, and content are all required!",
    );
  }

  // 1. Verify Book Exists
  const book = await findBookById(book_id);
  if (!book) {
    throw new ApiError(404, "Novel does not exist!");
  }

  // 2. CRITICAL OWNERSHIP CHECK: Does the logged-in user own the Persona of this Book?
  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this novel!");
  }

  if (volume_id) {
    const volume = await findVolumeById(Number(volume_id));
    if (!volume) {
      throw new ApiError(404, "The specified volume does not exist!");
    }
    if (volume.book_id !== Number(book_id)) {
      throw new ApiError(400, "Forbidden: This volume does not belong to this novel!");
    }
  }

  // 3. Automated Word Count Calculation
  const words_count = content.trim().split(/\s+/).length;

  // 4. Save Chapter in Neon DB
  const newChapter = await createChapter({
    book_id: Number(book_id),
    volume_id: volume_id ? Number(volume_id) : null,
    chapter_number: Number(chapter_number),
    title: title.trim(),
    content: content.trim(),
    words_count,
    status: status || "draft",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newChapter, "Chapter created successfully!"));
});

// 2. GET TABLE OF CONTENTS
export const getNovelTOC = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const chapters = await getTableOfContents(Number(bookId), req.user?.id);
  return res
    .status(200)
    .json(new ApiResponse(200, chapters, "Table of contents fetched successfully!"));
});

// 3. READ A SINGLE CHAPTER (Rich payload with paragraphs, navigation, reading time)
export const readChapter = asyncHandler(async (req, res) => {
  const { bookId, chapterNumber } = req.params;

  const chapter = await getChapterByNumber(
    Number(bookId),
    Number(chapterNumber),
    req.user?.id
  );
  if (!chapter) {
    throw new ApiError(404, "Chapter not found or not published yet!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chapter, "Chapter content fetched successfully!"));
});

// 4. LIVE SERIAL PULSE (4 most recent published chapters)
export const getLivePulse = asyncHandler(async (req, res) => {
  const chapters = await findLivePulseChapters();
  return res
    .status(200)
    .json(new ApiResponse(200, chapters, "Live serial pulse fetched successfully!"));
});

// 5. OFFLINE BATCH DUMP FOR INDEXEDDB
export const getOfflineBatch = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { start_chapter = 1, limit = 50 } = req.query;

  const chapters = await findOfflineBatchChapters(
    Number(bookId),
    start_chapter,
    limit,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, chapters, "Offline chapter batch fetched successfully!"));
});

// 6. SOFT DELETE A CHAPTER
export const deleteChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { book_id } = req.body;

  if (!book_id) {
    throw new ApiError(400, "book_id is required to delete a chapter!");
  }

  // Verify Book & Persona Ownership
  const book = await findBookById(book_id);
  if (!book) {
    throw new ApiError(404, "Novel not found!");
  }

  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this novel!");
  }

  const deletedChapter = await softDeleteChapter(Number(id), Number(book_id));
  if (!deletedChapter) {
    throw new ApiError(404, "Chapter not found or already deleted!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedChapter, "Chapter deleted successfully!"));
});
