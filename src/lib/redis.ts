// src/lib/redis.ts

import { Redis } from "@upstash/redis";

const url = process.env.REDIS_HOST!;
const token = process.env.REDIS_TOKEN!;

if (!url || !token) {
  throw new Error(
    "Missing Upstash Redis credentials: REDIS_HOST and REDIS_TOKEN must be set"
  );
}

const redis = new Redis({
  url,
  token,
});

export default redis;
