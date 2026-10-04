import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  revokeOtherSessions,
  getSettings,
  updateSettings,
  getReadingVelocity,
  getGenreAffinity,
  getSessions,
  revokeSession,
  toggle2FA,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/current-user", verifyJWT, getCurrentUser);
router.patch("/profile", verifyJWT, updateProfile);
router.post("/change-password", verifyJWT, changePassword);

// Settings
router.get("/settings", verifyJWT, getSettings);
router.patch("/settings", verifyJWT, updateSettings);

// Reading telemetry
router.get("/reading-velocity", verifyJWT, getReadingVelocity);
router.get("/genre-affinity", verifyJWT, getGenreAffinity);

// Session management
router.get("/sessions", verifyJWT, getSessions);
router.delete("/sessions/:id", verifyJWT, revokeSession);
router.post("/sessions/revoke-others", verifyJWT, revokeOtherSessions);

// Security & 2FA
router.post("/2fa/toggle", verifyJWT, toggle2FA);

export default router;
