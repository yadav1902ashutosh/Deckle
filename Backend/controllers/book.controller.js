import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createBook,
  findActiveBooks,
  findBookBySlug,
  softDeleteBook,
} from "../model/books.model.js";
import { findPersonaById } from "../model/personas.model.js";
import { getFallbackBookCover } from "../utils/imageReference.js";

//1.PUBLISH A NEW NOVEL
export const createNewBook = asyncHandler(async (req, res) => {
  const { title, slug, description, cover_image, persona_id, status, tags } =
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
  const persona = await findPersonaById(persona_id);
  if (!persona) {
    throw new ApiError(404, "The specified persona does not exist!");
  }
  if (persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this pen name!");
  }

  const parsedTags = Array.isArray(tags) ? tags : [];

  // Create novel in Neon DB with reliable reference cover fallback
  const newBook = await createBook({
    title: title.trim(),
    slug: cleanSlug,
    description: description?.trim() || null,
    cover_image: cover_image?.trim() || getFallbackBookCover(cleanSlug, parsedTags),
    persona_id,
    status: status || "ongoing",
    tags: parsedTags,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newBook, "Novel published successfully!"));
});

// 2. GET ACTIVE NOVELS (Catalog Feed)
export const getActiveBooksFeed = asyncHandler(async (req, res) => {
  const books = await findActiveBooks();
  return res
    .status(200)
    .json(new ApiResponse(200, books, "Books catalog fetched successfully!"));
});

// 3. GET NOVEL DETAILS BY SLUG
export const getBookDetails = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const book = await findBookBySlug(slug.toLowerCase().trim());
  if (!book) {
    throw new ApiError(404, "Novel not found!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, book, "Novel details fetched successfully!"));
});
// 4. SOFT DELETE A NOVEL
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
