import { Response } from "express";
import { prisma } from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import redis from "../lib/redis";
interface PlayerSummary {
  playerId: number;
  elo: number;
}

interface PlayerRow {
  id: number;
  elo: number;
}

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

  try {
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      const leaderboard: PlayerSummary[] = JSON.parse(cached);
      res.set("X-Cache", "HIT");
      res.json({ leaderboard });
      return;
    }
  } catch (err) {
    console.error("Redis cache parse error:", err);
    await redis.del(cacheKey);
  }

  const players = await prisma.player.findMany({
    where: { developerId },
    orderBy: { elo: "desc" },
    select: {
      id: true,
      elo: true,
    },
  });

  const leaderboard: PlayerSummary[] = players.map((p: PlayerRow) => ({
    playerId: p.id,
    elo: p.elo,
  }));

  await redis.set(cacheKey, JSON.stringify(leaderboard), { ex: 10 });

  res.set("X-Cache", "MISS");
  res.json({ leaderboard });
};
