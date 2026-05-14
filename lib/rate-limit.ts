/**
 * Lightweight in-memory rate limiter.
 * Good enough for single-instance dev/small-prod deployments.
 * Replace with Redis-backed solution (e.g. Upstash) for multi-instance deployments.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface Entry {
  attempts: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Periodically sweep expired entries to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, WINDOW_MS);

export interface RateLimitResult {
  allowed: boolean;
  /** How many attempts remain in this window (0 when blocked). */
  remaining: number;
  /** Milliseconds until the window resets (0 when allowed). */
  retryAfterMs: number;
}

/**
 * Check and record one attempt for `key` (typically a client IP).
 * Call once per inbound request; the first call in a window counts as attempt 1.
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { attempts: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterMs: 0 };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.attempts += 1;
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.attempts,
    retryAfterMs: 0,
  };
}
