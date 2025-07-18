interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 1000; // 1 minute window.
const MAX_REQUESTS = 60; // 60 requests per minute.

export async function rateLimit(identifier: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });

    return {
      success: true,
      limit: MAX_REQUESTS,
      reset: now + WINDOW_MS,
      remaining: MAX_REQUESTS - 1,
      headers: {
        'X-RateLimit-Limit': MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': (MAX_REQUESTS - 1).toString(),
        'X-RateLimit-Reset': (now + WINDOW_MS).toString(),
      },
    };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      success: false,
      limit: MAX_REQUESTS,
      reset: entry.resetTime,
      remaining: 0,
      headers: {
        'X-RateLimit-Limit': MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': entry.resetTime.toString(),
      },
    };
  }

  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    limit: MAX_REQUESTS,
    reset: entry.resetTime,
    remaining: MAX_REQUESTS - entry.count,
    headers: {
      'X-RateLimit-Limit': MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': (MAX_REQUESTS - entry.count).toString(),
      'X-RateLimit-Reset': entry.resetTime.toString(),
    },
  };
}
