import { Router } from "express";
import {
  createNewVolume,
  getBookVolumes,
  deleteVolume,
} from "../controllers/volume.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// --- Public Routes ---
// Get all volumes and arc counts for a book
router.get("/book/:bookId", getBookVolumes);

// --- Protected Routes (Require Login & Novel Ownership) ---
router.post("/", verifyJWT, upload.single("cover_image"), createNewVolume);
router.delete("/:id", verifyJWT, deleteVolume);

export default router;
