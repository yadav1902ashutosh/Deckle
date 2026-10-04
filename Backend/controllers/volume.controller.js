import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {
    createVolume,
    findVolumesByBookId,
    findVolumeById,
    softDeleteVolume
} from '../model/volumes.model.js';
import { findBookById } from "../model/books.model.js";
import { findPersonaById } from "../model/personas.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// 1. CREATE A NEW VOLUME (ARC)
export const createNewVolume = asyncHandler(async (req, res) => {
  const { book_id, volume_number, title, description, cover_image } = req.body;
  // Validation
  if (!book_id || !title?.trim()) {
    throw new ApiError(400, "book_id and title are required!");
  }
  // 1. Verify Book Exists
  const book = await findBookById(Number(book_id));
  if (!book) {
    throw new ApiError(404, "Novel does not exist!");
  }
  // 2. Security Check: Does the logged-in user own the Persona of this Book?
  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this novel!");
  }

  // Image Upload: check if file was uploaded via Multer
  let finalCoverImage = cover_image?.trim() || null;
  const coverLocalPath = req.file?.path;

  if (coverLocalPath) {
    const uploadResult = await uploadOnCloudinary(coverLocalPath, "deckle_volumes");
    if (uploadResult?.secure_url) {
      finalCoverImage = uploadResult.secure_url;
    }
  }

  // 3. Create Volume
  const newVolume = await createVolume({
    book_id: Number(book_id),
    volume_number: volume_number !== undefined && volume_number !== null && volume_number !== "" ? Number(volume_number) : undefined,
    title: title.trim(),
    description: description?.trim() || null,
    cover_image: finalCoverImage,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newVolume, "Volume created successfully!"));
});
// 2. GET ALL VOLUMES FOR A NOVEL (Public)
export const getBookVolumes = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const volumes = await findVolumesByBookId(Number(bookId));
  return res
    .status(200)
    .json(new ApiResponse(200, volumes, "Volumes fetched successfully!"));
});
// 3. DELETE A VOLUME
export const deleteVolume = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const volume = await findVolumeById(Number(id));
  if (!volume) {
    throw new ApiError(404, "Volume not found!");
  }
  // Verify Ownership
  const book = await findBookById(volume.book_id);
  const persona = await findPersonaById(book.persona_id);
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this novel!");
  }
  const deleted = await softDeleteVolume(Number(id));
  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Volume deleted successfully!"));
});