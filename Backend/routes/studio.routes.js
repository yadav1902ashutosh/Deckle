import { Router } from "express";
import {
  getMySerials,
  getAuthorBookChapters,
  getStudioChapterById,
  createStudioChapter,
  updateStudioChapter,
  deleteStudioChapter,
  getNovelAnalytics,
  toggleChannelSubscription,
  getChannelAnnouncements,
  postChannelAnnouncement,
} from "../controllers/studio.controller.js";
import { createNewBook } from "../controllers/book.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes for channel announcements
router.get("/announcements/:handle", getChannelAnnouncements);

// Protected routes (Login required)
router.get("/serials", verifyJWT, getMySerials);
router.get("/serials/:bookId/chapters", verifyJWT, getAuthorBookChapters);
router.post("/novels", verifyJWT, upload.single("cover_image"), createNewBook);
router.get("/chapters/:id", verifyJWT, getStudioChapterById);
router.post("/chapters", verifyJWT, createStudioChapter);
router.post("/chapters/draft", verifyJWT, createStudioChapter);
router.patch("/chapters/:id", verifyJWT, updateStudioChapter);
router.delete("/chapters/:id", verifyJWT, deleteStudioChapter);
router.get("/analytics", verifyJWT, getNovelAnalytics);
router.get("/analytics/:bookId", verifyJWT, getNovelAnalytics);

// Subscriptions & announcements
router.post("/subscribe/:id", verifyJWT, toggleChannelSubscription);
router.post("/announcements", verifyJWT, postChannelAnnouncement);

export default router;
