import { Response } from "express";
import { prisma } from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { v4 as uuidv4 } from "uuid";

let queue: { playerId: number; elo: number }[] = [];

export const joinMatchmaking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const developerId = req.developerId;
  const { playerId } = req.body;

  if (!developerId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  if (player.developerId !== developerId) {
    res.status(403).json({ error: "Player does not belong to your account" });
    return;
  }

  // 嘗試從 queue 找配對
  const matchIndex = queue.findIndex(
    (p) => Math.abs(p.elo - player.elo) < 100 && p.playerId !== playerId
  );

  if (matchIndex !== -1) {
    const matched = queue.splice(matchIndex, 1)[0];
    const roomCode = uuidv4();

    const match = await prisma.match.create({
      data: {
        player1Id: matched.playerId,
        player2Id: playerId,
        roomCode,
      },
    });

    res.json({
      matchFound: true,
      roomCode,
      matchId: match.id,
      players: [matched.playerId, playerId],
    });
  } else {
    queue.push({ playerId, elo: player.elo });
    res.json({ matchFound: false, message: "Waiting for opponent..." });
  }
};
