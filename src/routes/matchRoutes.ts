import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { getMatches } from "../controllers/matchController";

const router = express.Router();

router.get("/matches", authenticate, getMatches);

export default router;
