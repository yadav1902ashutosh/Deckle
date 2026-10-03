import { Router } from "express";
import {
  createNewBook,
  getActiveBooksFeed,
  getBookDetails,
  deleteBook,
} from "../controllers/book.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// --- Public Routes ---
router.get("/", getActiveBooksFeed);
router.get("/:slug", getBookDetails);

// --- Protected Routes (Require Login) ---
router.post("/", verifyJWT, createNewBook);
router.delete("/:id", verifyJWT, deleteBook);

export default router;
