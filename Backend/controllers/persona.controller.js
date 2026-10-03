import {
  createPersona,
  findPersonasByUserId,
  findPersonaByHandle,
} from "../model/personas.model.js";
import { findBooksByPersona } from "../model/books.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getFallbackAvatar,
  getFallbackBanner,
} from "../utils/imageReference.js";

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

  // Create a new persona linked to the logged-in user
  const newPersona = await createPersona({
    user_id: req.user.id,
    display_name: display_name.trim(),
    handle: cleanHandle,
    bio: bio?.trim() || null,
    avatar_url: avatar_url?.trim() || getFallbackAvatar(cleanHandle),
    banner_url: banner_url?.trim() || getFallbackBanner(cleanHandle),
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