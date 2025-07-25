export const mockRateLimit = jest.fn();

export const mockRateLimitSuccess = {
  success: true,
  limit: 60,
  reset: Date.now() + 60000,
  remaining: 59,
  headers: {
    'X-RateLimit-Limit': '60',
    'X-RateLimit-Remaining': '59',
    'X-RateLimit-Reset': (Date.now() + 60000).toString(),
  },
};

export const mockRateLimitFailure = {
  success: false,
  limit: 60,
  reset: Date.now() + 60000,
  remaining: 0,
  headers: {
    'X-RateLimit-Limit': '60',
    'X-RateLimit-Remaining': '0',
    'X-RateLimit-Reset': (Date.now() + 60000).toString(),
  },
};

export const mockRateLimitModule = () => {
  jest.mock('@/lib/rate-limit', () => ({
    rateLimit: mockRateLimit,
  }));
};

export const setupRateLimitMocks = () => {
  mockRateLimitModule();
};

export const mockRateLimitSuccessResponse = () => {
  mockRateLimit.mockResolvedValue(mockRateLimitSuccess);
};

export const mockRateLimitFailureResponse = () => {
  mockRateLimit.mockResolvedValue(mockRateLimitFailure);
};

export const mockRateLimitError = (
  error: Error = new Error('Rate limit error')
) => {
  mockRateLimit.mockRejectedValue(error);
};
