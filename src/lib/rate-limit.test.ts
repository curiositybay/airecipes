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

  it('should allow first request for new identifier', async () => {
    const result = await rateLimit('test-ip-1');

    expect(result.success).toBe(true);
    expect(result.limit).toBe(60);
    expect(result.remaining).toBe(59);
    expect(result.headers['X-RateLimit-Limit']).toBe('60');
    expect(result.headers['X-RateLimit-Remaining']).toBe('59');
    expect(result.headers['X-RateLimit-Reset']).toBeDefined();
  });

  it('should increment count for subsequent requests', async () => {
    const identifier = 'test-ip-2';

    // First request
    const result1 = await rateLimit(identifier);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(59);

    // Second request
    const result2 = await rateLimit(identifier);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(58);
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

  it('should reset after window expires', async () => {
    const identifier = 'test-ip-4';

    // Make one request
    const result1 = await rateLimit(identifier);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(59);

    // Mock time to advance past the window
    const originalDateNow = Date.now;
    const mockTime = Date.now() + 61000; // 61 seconds later
    Date.now = jest.fn(() => mockTime);

    // Make another request - should reset
    const result2 = await rateLimit(identifier);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(59); // Should be reset

    // Restore original Date.now
    Date.now = originalDateNow;
  });

  it('should handle multiple identifiers independently', async () => {
    const identifier1 = 'test-ip-5';
    const identifier2 = 'test-ip-6';

    // Make requests for first identifier
    const result1 = await rateLimit(identifier1);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(59);

    // Make requests for second identifier
    const result2 = await rateLimit(identifier2);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(59);

    // Both should be independent
    expect(result1.remaining).toBe(59);
    expect(result2.remaining).toBe(59);
  });

  it('should return correct headers for all scenarios', async () => {
    const identifier = 'test-ip-7';

    // First request
    const result1 = await rateLimit(identifier);
    expect(result1.headers).toEqual({
      'X-RateLimit-Limit': '60',
      'X-RateLimit-Remaining': '59',
      'X-RateLimit-Reset': expect.any(String),
    });

    // Second request
    const result2 = await rateLimit(identifier);
    expect(result2.headers).toEqual({
      'X-RateLimit-Limit': '60',
      'X-RateLimit-Remaining': '58',
      'X-RateLimit-Reset': expect.any(String),
    });
  });
});
