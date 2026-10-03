import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getLoreByChapterId,
  createChapterLore,
  getChapterLoreById,
  deleteChapterLore,
} from "../model/chapterLore.model.js";
import { findChapterById } from "../model/chapters.model.js";
import { findBookById } from "../model/books.model.js";
import { findPersonaById } from "../model/personas.model.js";

// Helper: check that logged-in user owns the novel this chapter belongs to
async function verifyChapterOwnership(chapterId, userId) {
  const chapter = await findChapterById(chapterId);
  if (!chapter) {
    throw new ApiError(404, "Chapter not found!");
  }

  const book = await findBookById(chapter.book_id);
  if (!book) {
    throw new ApiError(404, "Novel not found!");
  }

  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== userId) {
    throw new ApiError(403, "Forbidden: You do not own this novel!");
  }

  return { chapter, book, persona };
}

// 1. GET ALL LORE FOR A CHAPTER (Public - Readers hover tooltips)
export const getChapterLoreList = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;

  const lore = await getLoreByChapterId(Number(chapterId));

  return res
    .status(200)
    .json(new ApiResponse(200, lore, "Chapter lore fetched successfully!"));
});

// 2. CREATE A LORE ANNOTATION (Protected - Author)
export const addChapterLore = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const { term, definition, order_index } = req.body;

  if (!term?.trim() || !definition?.trim()) {
    throw new ApiError(400, "Term and definition are required!");
  }

  await verifyChapterOwnership(Number(chapterId), req.user.id);

  const newLore = await createChapterLore({
    chapter_id: Number(chapterId),
    term: term.trim(),
    definition: definition.trim(),
    order_index: Number(order_index) || 0,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newLore, "Lore entry created successfully!"));
});

// 3. DELETE A LORE ANNOTATION (Protected - Author)
export const removeChapterLore = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lore = await getChapterLoreById(Number(id));
  if (!lore) {
    throw new ApiError(404, "Lore entry not found!");
  }

  await verifyChapterOwnership(lore.chapter_id, req.user.id);

  const deleted = await deleteChapterLore(Number(id));

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Lore entry deleted successfully!"));
});
