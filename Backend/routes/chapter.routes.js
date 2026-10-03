import { Router } from "express";
import {
  createNewChapter,
  getNovelTOC,
  readChapter,
  deleteChapter,
} from "../controllers/chapter.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// --- Public Routes ---
// Table of Contents for a novel
router.get("/book/:bookId/toc", getNovelTOC);

// Read a single published chapter
router.get("/book/:bookId/read/:chapterNumber", readChapter);

// --- Protected Routes (Require Login & Ownership) ---
router.post("/", verifyJWT, createNewChapter);
router.delete("/:id", verifyJWT, deleteChapter);

export default router;
