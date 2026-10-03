import { Router } from "express";
import {
  syncReadingProgress,
  updateBookshelf,
  getBookshelf,
  getReadingHistory,
  getSingleBookProgress,
} from "../controllers/readingHistory.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All reading history & bookshelf endpoints require authentication
router.use(verifyJWT);

// Sync current reading location (chapter # and scroll percentage)
router.post("/progress", syncReadingProgress);

// Add / move / favorite a book on reader's shelf
router.post("/shelf", updateBookshelf);

// Fetch bookshelf items (optional ?folder=Reading|Completed|Plan+to+Read)
router.get("/shelf", getBookshelf);

// Fetch recent reading history activity
router.get("/recent", getReadingHistory);

// Get progress for a single book
router.get("/book/:bookId", getSingleBookProgress);

export default router;
