import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

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
