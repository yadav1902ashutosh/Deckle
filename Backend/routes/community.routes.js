import { Router } from "express";
import {
  getThreadsFeed,
  createNewThread,
  toggleThreadUpvote,
  getScholarsLeaderboard,
  getThreadDetails,
  getThreadReplies,
  postThreadReply,
} from "../controllers/community.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/threads", getThreadsFeed);
router.get("/threads/:id", getThreadDetails);
router.get("/threads/:id/replies", getThreadReplies);
router.get("/top-scholars", getScholarsLeaderboard);

// Protected routes (Login required)
router.post("/threads", verifyJWT, createNewThread);
router.post("/threads/:id/upvote", verifyJWT, toggleThreadUpvote);
router.post("/threads/:id/replies", verifyJWT, postThreadReply);

export default router;
