import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

export const redis = REDIS_URL ? new Redis(REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true }) : null;

if (redis) {
  redis.connect().catch(() => {
    console.warn("[redis] Could not connect — caching disabled, falling back to direct DB queries.");
  });
  redis.on("error", () => {
    // Swallow noisy repeated connection errors — caching is a pure optimization,
    // never a hard dependency for the API to function.
  });
}

/**
 * Reads a JSON value from cache, or computes + caches it via `fetcher` on a miss.
 * If Redis isn't configured or is unreachable, transparently falls back to calling
 * `fetcher` directly — caching is always optional, never load-bearing.
 */
export async function cached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  if (!redis || redis.status !== "ready") return fetcher();

  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    return fetcher();
  }

  const fresh = await fetcher();
  redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds).catch(() => null);
  return fresh;
}

export async function invalidateCache(pattern: string) {
  if (!redis || redis.status !== "ready") return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch {
    // best-effort invalidation only
  }
}
