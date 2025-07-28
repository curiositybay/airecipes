export const mockFetchResponse = {
  ok: true,
  status: 200,
};

export const mockFetchErrorResponse = {
  ok: false,
  status: 500,
};

export const mockNetworkError = new Error('Network error');

export const setupFetchMocks = () => {
  global.fetch = jest.fn();
};

export const mockFetchSuccess = (response: unknown) => {
  (global.fetch as jest.Mock).mockResolvedValue(response);
};

export const mockFetchFailure = (error: Error = mockNetworkError) => {
  (global.fetch as jest.Mock).mockRejectedValue(error);
};
