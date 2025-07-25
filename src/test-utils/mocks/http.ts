export const mockFetchResponse = {
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
};

export const mockFetchErrorResponse = {
  ok: false,
  status: 500,
  json: () => Promise.resolve({ error: 'Internal server error' }),
};

export const mockAuthSuccessResponse = {
  ok: true,
  status: 200,
  json: () =>
    Promise.resolve({
      success: true,
      user: { id: '1', email: 'test@example.com' },
    }),
};

export const mockAuthFailureResponse = {
  ok: false,
  status: 401,
  json: () =>
    Promise.resolve({
      success: false,
      error: 'Invalid token',
    }),
};

export const mockNetworkError = new Error('Network error');

export const setupFetchMocks = () => {
  global.fetch = jest.fn();
};

export const mockFetchSuccess = (response: unknown = mockFetchResponse) => {
  (global.fetch as jest.Mock).mockResolvedValue(response);
};

export const mockFetchFailure = (error: Error = mockNetworkError) => {
  (global.fetch as jest.Mock).mockRejectedValue(error);
};
