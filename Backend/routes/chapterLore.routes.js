import { Router } from "express";
import {
  getChapterLoreList,
  addChapterLore,
  removeChapterLore,
} from "../controllers/chapterLore.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// --- Public Routes (Readers) ---
router.get("/chapter/:chapterId", getChapterLoreList);

// --- Protected Routes (Authors) ---
router.post("/chapter/:chapterId", verifyJWT, addChapterLore);
router.delete("/:id", verifyJWT, removeChapterLore);

export default router;
