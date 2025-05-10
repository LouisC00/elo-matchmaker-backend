import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
let queue: { playerId: number; elo: number }[] = [];

export const joinMatchmaking = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { playerId } = req.body;

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  // 嘗試找到配對
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
