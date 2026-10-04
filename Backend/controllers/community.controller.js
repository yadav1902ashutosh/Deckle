import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  findThreads,
  createThread,
  upvoteThread,
  getTopScholars,
  findThreadById,
  findRepliesByThreadId,
  createReply,
} from "../model/community.model.js";
import { findPersonasByUserId, findPersonaById } from "../model/personas.model.js";

// 1. GET DISCOURSE THREADS FEED
export const getThreadsFeed = asyncHandler(async (req, res) => {
  const { category, book_id, limit } = req.query;
  const threads = await findThreads({ category, book_id, limit });
  return res
    .status(200)
    .json(new ApiResponse(200, threads, "Forum threads fetched successfully!"));
});

// 2. CREATE A NEW THREAD
export const createNewThread = asyncHandler(async (req, res) => {
  const { title, content, book_id, category, tags } = req.body;

  if (!title?.trim() || !content?.trim()) {
    throw new ApiError(400, "Title and content are required to start discourse!");
  }

  // Resolve user's persona
  const reqPersonaId = req.headers["x-persona-id"] || req.body.persona_id;
  let personaId = null;
  if (reqPersonaId) {
    const p = await findPersonaById(Number(reqPersonaId));
    if (p && p.user_id === req.user.id) personaId = p.id;
  }
  if (!personaId) {
    const personas = await findPersonasByUserId(req.user.id);
    personaId = personas.length > 0 ? personas[0].id : null;
  }

  const newThread = await createThread({
    book_id: book_id ? Number(book_id) : null,
    user_id: req.user.id,
    persona_id: personaId,
    title: title.trim(),
    content: content.trim(),
    category: category || "all",
    tags: Array.isArray(tags) ? tags : [],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newThread, "Thread published successfully!"));
});

// 3. UPVOTE A THREAD
export const toggleThreadUpvote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await upvoteThread(Number(id), req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Thread upvote updated successfully!"));
});

// 4. GET TOP SCHOLARS LEADERBOARD
export const getScholarsLeaderboard = asyncHandler(async (req, res) => {
  const scholars = await getTopScholars();
  return res
    .status(200)
    .json(new ApiResponse(200, scholars, "Top scholars fetched successfully!"));
});

// 5. GET SINGLE THREAD DETAILS
export const getThreadDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const thread = await findThreadById(Number(id));
  if (!thread) {
    throw new ApiError(404, "Discussion thread not found!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, thread, "Thread details fetched successfully!"));
});

// 6. GET THREAD REPLIES
export const getThreadReplies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const replies = await findRepliesByThreadId(Number(id));
  return res
    .status(200)
    .json(new ApiResponse(200, replies, "Thread replies fetched successfully!"));
});

// 7. POST THREAD REPLY
export const postThreadReply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, parent_reply_id } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Reply content is required!");
  }

  const thread = await findThreadById(Number(id));
  if (!thread) {
    throw new ApiError(404, "Discussion thread not found!");
  }

  // Resolve user's persona
  const reqPersonaId = req.headers["x-persona-id"] || req.body.persona_id;
  let personaId = null;
  if (reqPersonaId) {
    const p = await findPersonaById(Number(reqPersonaId));
    if (p && p.user_id === req.user.id) personaId = p.id;
  }
  if (!personaId) {
    const personas = await findPersonasByUserId(req.user.id);
    personaId = personas.length > 0 ? personas[0].id : null;
  }

  const newReply = await createReply({
    thread_id: Number(id),
    user_id: req.user.id,
    persona_id: personaId,
    parent_reply_id: parent_reply_id ? Number(parent_reply_id) : null,
    content: content.trim(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newReply, "Reply posted successfully!"));
});
