import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

export const getMatches = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const developerId = req.developerId;

  if (!developerId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const matches = await prisma.match.findMany({
    where: {
      player1: { developerId },
      player2: { developerId },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      player1Id: true,
      player2Id: true,
      winnerId: true,
      createdAt: true,
    },
  });

  res.json(matches);
};
