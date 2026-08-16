import { Redis } from "@upstash/redis";

// Attached via Vercel: Storage -> Create Database -> Upstash for Redis.
// Supports both the KV_* names (Vercel marketplace) and UPSTASH_* names.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;
