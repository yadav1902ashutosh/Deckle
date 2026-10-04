import { Router } from "express";
import {
  createNewBook,
  getActiveBooksFeed,
  getFeaturedBooks,
  getRankings,
  getTrendingTags,
  getGenresList,
  searchBooksCatalog,
  getBookDetails,
  getBookRecommendations,
  votePowerStone,
  deleteBook,
} from "../controllers/book.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// --- Public Routes Mounted BEFORE /:slug ---
router.get("/", getActiveBooksFeed);
router.get("/featured", getFeaturedBooks);
router.get("/rankings", getRankings);
router.get("/trending-tags", getTrendingTags);
router.get("/genres", getGenresList);
router.get("/search", searchBooksCatalog);

// --- Public Routes with /:slug Parameter ---
router.get("/:slug", optionalVerifyJWT, getBookDetails);
router.get("/:slug/recommendations", getBookRecommendations);

// --- Protected Routes (Require Login) ---
router.post("/", verifyJWT, upload.single("cover_image"), createNewBook);
router.post("/:slug/power-stones", verifyJWT, votePowerStone);
router.delete("/:id", verifyJWT, deleteBook);

export default router;
