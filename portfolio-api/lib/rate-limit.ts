// Best-effort per-IP rate limiting.
//
// ⚠️ Deliberate limitation: this state lives in the memory of a single warm
// serverless instance. Vercel may run several instances concurrently and
// discards them when idle, so a determined attacker can exceed the limit by
// spreading requests across cold starts. It is here to stop the ordinary case —
// one visitor holding down Enter, or a naive scraper — not to be a security
// control.
//
// For the chat endpoint the real spend ceiling is Groq's own quota plus the
// small `max_tokens` per completion. For the contact endpoint it is the email
// provider's daily send limit. If either ever needs to be robust, move the
// counter to Upstash Redis (`@upstash/ratelimit`), which is shared across
// instances and has a free tier.

export interface RateLimitResult {
  allowed: boolean;
  // Seconds the caller should wait before retrying. Zero when allowed.
  retryAfterSeconds: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

// Bounds memory growth on a long-lived instance: once this many distinct keys
// are tracked, expired entries are swept before inserting a new one.
const SWEEP_THRESHOLD = 1_000;

// Each limiter owns its own bucket, so endpoints with different budgets never
// share or clobber each other's counters.
export const createRateLimiter = ({ windowMs, max }: RateLimiterOptions) => {
  const hits = new Map<string, number[]>();

  const sweepExpired = (now: number): void => {
    for (const [key, timestamps] of hits) {
      const live = timestamps.filter((at) => now - at < windowMs);
      if (live.length === 0) hits.delete(key);
      else hits.set(key, live);
    }
  };

  return (key: string): RateLimitResult => {
    const now = Date.now();

    if (hits.size >= SWEEP_THRESHOLD) sweepExpired(now);

    const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);

    if (recent.length >= max) {
      hits.set(key, recent);
      const oldest = recent[0];
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((windowMs - (now - oldest)) / 1000),
        ),
      };
    }

    recent.push(now);
    hits.set(key, recent);
    return { allowed: true, retryAfterSeconds: 0 };
  };
};
