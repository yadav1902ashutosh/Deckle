import { Router } from "express";
import {
  getBookshelf,
  toggleBookshelf,
  batchRemoveBooks,
  batchMoveBooks,
  getLibraryOverviewStats,
  getReadingHistory,
  recordProgress,
  clearReadingHistory,
  getWeeklyGoal,
} from "../controllers/library.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All library routes require authentication
router.use(verifyJWT);

// Bookshelf & library stats
router.get("/", getBookshelf);
router.get("/shelf", getBookshelf);
router.post("/shelf", toggleBookshelf);
router.post("/batch-remove", batchRemoveBooks);
router.post("/shelf/batch-remove", batchRemoveBooks);
router.post("/batch-move", batchMoveBooks);
router.post("/shelf/batch-move", batchMoveBooks);
router.get("/stats", getLibraryOverviewStats);

// Reading history & progress
router.get("/history", getReadingHistory);
router.post("/progress", recordProgress);
router.delete("/clear", clearReadingHistory);
router.delete("/history", clearReadingHistory);

// Weekly reading goal
router.get("/goal", getWeeklyGoal);
router.get("/weekly-goal", getWeeklyGoal);

export default router;
