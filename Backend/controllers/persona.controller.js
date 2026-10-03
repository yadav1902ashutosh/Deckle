import {
  createPersona,
  findPersonasByUserId,
  findPersonaByHandle,
  findPersonaById,
  updatePersonaPreferences,
  incrementPersonaReadingStats,
  softDeletePersona,
} from "../model/personas.model.js";
import { findBooksByPersona } from "../model/books.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getFallbackAvatar,
  getFallbackBanner,
} from "../utils/imageReference.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// 1. CREATE A NEW PEN NAME
export const createNewPersona = asyncHandler(async (req, res) => {
  const { display_name, handle, bio, avatar_url, banner_url } = req.body;

  if (!display_name?.trim() || !handle?.trim()) {
    throw new ApiError(400, "Display name and unique handle are required");
  }

  // Format handle cleanly (e.g. remove leading '@' and lowercase it)
  const cleanHandle = handle.replace(/^@/, "").toLowerCase().trim();

  // Check if handle already exists
  const existingPersona = await findPersonaByHandle(cleanHandle);

  if (existingPersona) {
    throw new ApiError(409, `The handle @${cleanHandle} is already taken`);
  }

  // File Upload: Avatar & Banner from Multer
  let finalAvatarUrl = avatar_url?.trim() || null;
  let finalBannerUrl = banner_url?.trim() || null;

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const bannerLocalPath = req.files?.banner?.[0]?.path;

  if (avatarLocalPath) {
    const avatarResult = await uploadOnCloudinary(avatarLocalPath, "deckle_avatars");
    if (avatarResult?.secure_url) {
      finalAvatarUrl = avatarResult.secure_url;
    }
  }

  if (bannerLocalPath) {
    const bannerResult = await uploadOnCloudinary(bannerLocalPath, "deckle_banners");
    if (bannerResult?.secure_url) {
      finalBannerUrl = bannerResult.secure_url;
    }
  }

  // Fallbacks if not uploaded
  if (!finalAvatarUrl) finalAvatarUrl = getFallbackAvatar(cleanHandle);
  if (!finalBannerUrl) finalBannerUrl = getFallbackBanner(cleanHandle);

  // Create a new persona linked to the logged-in user
  const newPersona = await createPersona({
    user_id: req.user.id,
    display_name: display_name.trim(),
    handle: cleanHandle,
    bio: bio?.trim() || null,
    avatar_url: finalAvatarUrl,
    banner_url: finalBannerUrl,
    is_default: false,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newPersona, "New pen name created successfully!")
    );
});

// 2. GET ALL THE USER PERSONAS
export const getMyPersonas = asyncHandler(async (req, res) => {
  const personas = await findPersonasByUserId(req.user.id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, personas, "User personas fetched successfully!")
    );
});

// 3. GET PUBLIC PERSONA PROFILE (Public view of an author + their novels)
export const getPublicPersonaProfile = asyncHandler(async (req, res) => {
  const { handle } = req.params;
  const cleanHandle = handle.replace(/^@/, "").toLowerCase().trim();
  const persona = await findPersonaByHandle(cleanHandle);
  if (!persona) {
    throw new ApiError(404, `No author found with handle "@${cleanHandle}"`);
  }
  // Fetch all books written under this specific pen name
  const books = await findBooksByPersona(persona.id);
  // Return author info + their published works
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { persona, books },
        "Author profile fetched successfully!"
      )
    );
});

// 4. UPDATE READING PREFERENCES (Theme, Font, Font Size, Favorite Genres)
export const updatePreferences = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== "object") {
    throw new ApiError(400, "Valid preferences object is required!");
  }

  const updated = await updatePersonaPreferences(
    Number(id),
    req.user.id,
    preferences
  );

  if (!updated) {
    throw new ApiError(404, "Persona not found or you do not have permission!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updated, "Reading preferences updated successfully!")
    );
});

// 5. INCREMENT WORDS READ & STREAK (Reading session tracker)
export const incrementStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { wordsCount } = req.body;

  const persona = await findPersonaById(Number(id));
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this persona!");
  }

  const stats = await incrementPersonaReadingStats(
    Number(id),
    wordsCount ? Number(wordsCount) : 0
  );

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Reading stats updated successfully!"));
});

// 6. SOFT DELETE A PERSONA
export const deletePersona = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const persona = await findPersonaById(Number(id));
  if (!persona || persona.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You do not own this persona!");
  }

  if (persona.is_default) {
    throw new ApiError(400, "Cannot delete your default primary persona!");
  }

  const deleted = await softDeletePersona(Number(id), req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Persona deleted successfully!"));
});