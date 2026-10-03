import { Router } from "express";
import {
  createNewBook,
  getActiveBooksFeed,
  getBookDetails,
  deleteBook,
} from "../controllers/book.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// --- Public Routes ---
router.get("/", getActiveBooksFeed);
router.get("/:slug", getBookDetails);

// --- Protected Routes (Require Login) ---
router.post("/", verifyJWT, upload.single("cover_image"), createNewBook);
router.delete("/:id", verifyJWT, deleteBook);

export default router;
