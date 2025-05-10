import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/leaderboard", authenticate, getLeaderboard);

export default router;
