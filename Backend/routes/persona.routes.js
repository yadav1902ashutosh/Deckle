import { Router } from "express";
import {
  createNewPersona,
  getMyPersonas,
  getPublicPersonaProfile,
  updatePreferences,
  incrementStats,
  deletePersona,
} from "../controllers/persona.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// --- Public Route (View any author's page by handle) ---
router.get("/:handle", getPublicPersonaProfile);

// --- Protected Routes (Require Login) ---
router.post(
  "/",
  verifyJWT,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createNewPersona
);
router.get("/my", verifyJWT, getMyPersonas);
router.patch("/:id/preferences", verifyJWT, updatePreferences);
router.post("/:id/stats/increment", verifyJWT, incrementStats);
router.delete("/:id", verifyJWT, deletePersona);

export default router;
