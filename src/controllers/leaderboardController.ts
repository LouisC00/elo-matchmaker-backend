import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

export const getLeaderboard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const developerId = req.developerId;

  if (!developerId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const players = await prisma.player.findMany({
    where: { developerId },
    orderBy: { elo: "desc" },
    select: {
      id: true,
      elo: true,
    },
  });

  res.json({
    leaderboard: players.map((p) => ({
      playerId: p.id,
      elo: p.elo,
    })),
  });
};
