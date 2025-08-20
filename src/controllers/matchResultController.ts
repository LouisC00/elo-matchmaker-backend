import { Request, Response } from "express";
import { prisma } from "../lib/db";
import redis from "../lib/redis";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const reportMatchResult = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const developerId = req.developerId;
  const { matchId, winnerId } = req.body as {
    matchId: number;
    winnerId: number;
  };

  if (!developerId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!matchId || !winnerId) {
    res.status(400).json({ error: "Missing matchId or winnerId" });
    return;
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      player1: true,
      player2: true,
    },
  });

  if (
    !match ||
    match.player1.developerId !== developerId ||
    match.player2.developerId !== developerId
  ) {
    res.status(404).json({ error: "Match not found or unauthorized" });
    return;
  }

  if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
    res.status(400).json({ error: "winnerId must be player1Id or player2Id" });
    return;
  }

  if (match.winnerId) {
    res.status(409).json({ error: "Match result already reported" });
    return;
  }

  const p1 = match.player1;
  const p2 = match.player2;
  const r1 = p1.elo;
  const r2 = p2.elo;

  const expected1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
  const expected2 = 1 - expected1;
  const K = 32;
  const s1 = winnerId === p1.id ? 1 : 0;
  const s2 = 1 - s1;

  const newR1 = Math.round(r1 + K * (s1 - expected1));
  const newR2 = Math.round(r2 + K * (s2 - expected2));

  await prisma.$transaction([
    prisma.player.update({ where: { id: p1.id }, data: { elo: newR1 } }),
    prisma.player.update({ where: { id: p2.id }, data: { elo: newR2 } }),
    prisma.match.update({ where: { id: matchId }, data: { winnerId } }),
  ]);

  await redis.del(`leaderboard:${developerId}`);

  res.json({
    message: "Match result recorded",
    newElo: { [p1.id]: newR1, [p2.id]: newR2 },
  });
};
