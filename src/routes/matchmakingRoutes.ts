import express from "express";
import { joinMatchmaking } from "../controllers/matchmakingController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/matchmaking/join", authenticate, joinMatchmaking);

export default router;
