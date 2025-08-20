import { Response } from "express";
import { prisma } from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { CreatePlayerBody } from "../lib/validation";

export const createPlayer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const developerId = req.developerId;
  if (!developerId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreatePlayerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const player = await prisma.player.create({
    data: {
      developerId,
      elo: parsed.data.elo ?? 1000,
    },
  });

  res.status(201).json({
    message: "Player created successfully",
    playerId: player.id,
    elo: player.elo,
  });
};
