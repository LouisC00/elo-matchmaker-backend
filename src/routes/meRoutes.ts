import express from "express";
import { getDeveloperInfo } from "../controllers/meController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/me", authenticate, getDeveloperInfo);

export default router;
