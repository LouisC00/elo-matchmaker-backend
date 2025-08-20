import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../lib/db";
import { v4 as uuidv4 } from "uuid";

import { zaddScore, zrangeByScore, zrem, multi } from "../lib/mmQueue";

const WINDOW_BASE = 100;
const WINDOW_STEP = 25;
const WINDOW_INTERVAL_SEC = 10;
const WINDOW_MAX = 400;
const nowSec = () => Math.floor(Date.now() / 1000);

export const joinMatchmaking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const developerId = req.developerId;
  const { playerId } = req.body as { playerId: number };

  if (!developerId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!playerId || typeof playerId !== "number") {
    res.status(400).json({ error: "playerId (number) is required" });
    return;
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  if (player.developerId !== developerId) {
    res.status(403).json({ error: "Player does not belong to your account" });
    return;
  }

  const poolKey = `mm:${developerId}:pool`;
  const lockKey = `mm:${developerId}:lock:${playerId}`;

  const joinedAt = nowSec();

  await zaddScore(poolKey, player.elo, `${playerId}:${joinedAt}`);

  const elapsed = 0;
  const widen = Math.min(
    WINDOW_BASE + Math.floor(elapsed / WINDOW_INTERVAL_SEC) * WINDOW_STEP,
    WINDOW_MAX
  );
  const min = player.elo - widen;
  const max = player.elo + widen;

  const candidates = await zrangeByScore(poolKey, min, max, 10);
  const candidate = candidates
    .map((v) => ({
      raw: v,
      pid: parseInt(v.split(":")[0], 10),
      ts: parseInt(v.split(":")[1], 10),
    }))
    .filter((c) => c.pid !== playerId)
    .sort((a, b) => a.ts - b.ts)[0];

  if (!candidate) {
    res.json({ matchFound: false, message: "Waiting for opponent..." });
    return;
  }

  const tx = multi();
  tx.zrem(poolKey, candidate.raw);
  tx.zrem(poolKey, `${playerId}:${joinedAt}`);
  const exec = await tx.exec();
  const removed =
    exec && exec.every((r) => (typeof r === "number" ? r : 0) >= 1);
  if (!removed) {
    res.json({ matchFound: false, message: "Race detected, retry..." });
    return;
  }

  const roomCode = uuidv4();
  const match = await prisma.match.create({
    data: { player1Id: candidate.pid, player2Id: playerId, roomCode },
    select: { id: true },
  });

  res.json({
    matchFound: true,
    roomCode,
    matchId: match.id,
    players: [candidate.pid, playerId],
  });
};
