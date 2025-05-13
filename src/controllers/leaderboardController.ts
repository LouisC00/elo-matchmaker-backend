import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import redis from "../lib/redis";

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

  const cacheKey = `leaderboard:${developerId}`;

  // 1. Check if there's cache on redis
  const cached = await redis.get<{ playerId: number; elo: number }[]>(cacheKey);

  if (cached) {
    res.set("X-Cache", "HIT");
    res.json({ leaderboard: cached });
    return;
  }

  // 2. check database
  const players = await prisma.player.findMany({
    where: { developerId },
    orderBy: { elo: "desc" },
    select: {
      id: true,
      elo: true,
    },
  });

  const leaderboard = players.map((p: { id: number; elo: number }) => ({
    playerId: p.id,
    elo: p.elo,
  }));

  // 3. load redis cache (limit 10 seconds)
  await redis.set(cacheKey, JSON.stringify(leaderboard), { ex: 10 });

  res.set("X-Cache", "MISS");
  res.json({ leaderboard });
};
