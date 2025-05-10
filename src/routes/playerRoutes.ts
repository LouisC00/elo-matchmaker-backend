import express from "express";
import { createPlayer } from "../controllers/playerController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/player", authenticate, createPlayer);

export default router;
