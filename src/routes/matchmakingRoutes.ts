import express from "express";
import { joinMatchmaking } from "../controllers/matchmakingController";

const router = express.Router();
router.post("/matchmaking/join", joinMatchmaking);

export default router;
