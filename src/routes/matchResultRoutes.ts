import express from "express";
import { reportMatchResult } from "../controllers/matchResultController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/match/result", authenticate, reportMatchResult);

export default router;
