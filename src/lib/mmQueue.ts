// src/lib/mmQueue.ts

import redis from "./redis";

export async function zaddScore(key: string, score: number, member: string) {
  return await redis.zadd(key, { score, member });
}

export async function zrangeByScore(
  key: string,
  min: number,
  max: number,
  limitCount = 10
): Promise<string[]> {
  // Upstash API: use zrange with byScore
  const res = await redis.zrange<string[]>(key, min, max, { byScore: true });
  // Just slice the first N here
  return res.slice(0, limitCount);
}

export async function zrem(key: string, member: string) {
  return await redis.zrem(key, member);
}

export function multi() {
  return redis.multi();
}
