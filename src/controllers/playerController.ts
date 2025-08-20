import { Response } from "express";
import { prisma } from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const createPlayer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const developerId = req.developerId;
  const { elo } = req.body;

  if (!developerId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const player = await prisma.player.create({
    data: {
      elo: elo ?? 1000,
      developerId,
    },
  });

  res.status(201).json({
    message: "Player created successfully",
    playerId: player.id,
    elo: player.elo,
  });
};
