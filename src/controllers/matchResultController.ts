import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import redis from "../lib/redis";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

export const reportMatchResult = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const developerId = req.developerId;
  const { matchId, winnerId } = req.body;

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

  if (match.winnerId) {
    res.status(400).json({ error: "Match result already reported" });
    return;
  }

  const [p1, p2] = [match.player1, match.player2];
  const [r1, r2] = [p1.elo, p2.elo];

  // calculate win rate
  const expected1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));

  const K = 32;
  const winnerIsP1 = winnerId === p1.id;

  const newR1 = Math.round(
    r1 + K * (winnerIsP1 ? 1 - expected1 : 0 - expected1)
  );
  const newR2 = Math.round(
    r2 + K * (winnerIsP1 ? 0 - expected2 : 1 - expected2)
  );

  await prisma.$transaction([
    prisma.player.update({
      where: { id: p1.id },
      data: { elo: newR1 },
    }),
    prisma.player.update({
      where: { id: p2.id },
      data: { elo: newR2 },
    }),
    prisma.match.update({
      where: { id: matchId },
      data: { winnerId },
    }),
  ]);

  // clean leaderboard cache
  await redis.del(`leaderboard:${developerId}`);

  res.json({
    message: "Match result recorded",
    newElo: { [p1.id]: newR1, [p2.id]: newR2 },
  });
};
