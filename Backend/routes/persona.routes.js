import { Router } from "express";
import {
  createNewPersona,
  getMyPersonas,
  getPublicPersonaProfile,
} from "../controllers/persona.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();


// --- Protected Routes (Require Login) ---
router.post("/", verifyJWT, createNewPersona);
router.get("/my", verifyJWT, getMyPersonas);


// --- Public Route (View any author's page by handle) ---
router.get("/:handle", getPublicPersonaProfile);

export default router;
