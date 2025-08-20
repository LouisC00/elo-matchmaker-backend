import { z } from "zod";

export const CreatePlayerBody = z.object({
  elo: z.number().int().min(0).max(4000).optional(),
});

export const JoinMatchmakingBody = z.object({
  playerId: z.number().int().positive(),
});

export const ReportMatchBody = z.object({
  matchId: z.number().int().positive(),
  winnerId: z.number().int().positive(),
});
