import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
  beforeEach(async () => {
    // Clear the rate limit store before each test
    // @ts-expect-error - accessing private store for testing
    const { rateLimitStore } = await import('./rate-limit');
    if (rateLimitStore && rateLimitStore.clear) {
      rateLimitStore.clear();
    }
  });

  it('should block requests when limit is exceeded', async () => {
    const identifier = 'test-ip-3';

    // Make 60 requests to reach the limit
    for (let i = 0; i < 60; i++) {
      const result = await rateLimit(identifier);
      expect(result.success).toBe(true);
    }
    // 61st request should be blocked
    const blocked = await rateLimit(identifier);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.headers['X-RateLimit-Remaining']).toBe('0');
  });
});
