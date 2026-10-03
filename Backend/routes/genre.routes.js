import { Router } from "express";
import {
  getGenresList,
  getGenreDetails,
  createNewGenre,
} from "../controllers/genre.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// --- Public Routes ---
// Get all curated genres for navigation/filters
router.get("/", getGenresList);

// Get single genre by slug
router.get("/:slug", getGenreDetails);

// --- Protected Routes ---
router.post("/", verifyJWT, createNewGenre);

export default router;
