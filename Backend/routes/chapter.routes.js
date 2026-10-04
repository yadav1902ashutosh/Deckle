import { Router } from "express";
import {
  createNewChapter,
  getNovelTOC,
  readChapter,
  getLivePulse,
  getOfflineBatch,
  deleteChapter,
} from "../controllers/chapter.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// --- Public Routes ---
// Live serial pulse feed
router.get("/live-pulse", getLivePulse);

// Offline batch dump for IndexedDB reader
router.get("/offline-batch/:bookId", getOfflineBatch);

// Table of Contents for a novel
router.get("/book/:bookId/toc", optionalVerifyJWT, getNovelTOC);

// Read a single published chapter
router.get("/book/:bookId/read/:chapterNumber", optionalVerifyJWT, readChapter);

// --- Protected Routes (Require Login & Ownership) ---
router.post("/", verifyJWT, createNewChapter);
router.delete("/:id", verifyJWT, deleteChapter);

export default router;
