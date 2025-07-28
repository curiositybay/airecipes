import mocks from '@/test-utils/mocks/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: mocks.mock.prisma.client,
}));

describe('api/v1/ingredients/random/route', () => {
  let GET: () => Promise<Response>;

  beforeEach(() => {
    jest.resetModules();
    mocks.setup.all();
    ({ GET } = jest.requireActual('./route'));
  });

  afterEach(() => {
    mocks.setup.clear();
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns random ingredients successfully', async () => {
      const mockIngredients = [
        { id: 1, name: 'tomato', category: 'vegetables' },
        { id: 2, name: 'pasta', category: 'grains' },
        { id: 3, name: 'olive oil', category: 'oils' },
        { id: 4, name: 'garlic', category: 'vegetables' },
      ];

      mocks.mock.prisma.client.$queryRaw.mockResolvedValue(mockIngredients);

      const response = await GET();
      const responseData = await response.json();

      expect(mocks.mock.prisma.client.$queryRaw).toHaveBeenCalled();
      expect(responseData).toEqual({
        success: true,
        ingredients: mockIngredients,
      });
      expect(response.status).toBe(200);
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mocks.mock.prisma.client.$queryRaw.mockRejectedValue(error);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to fetch random ingredients');
    });

    it('returns empty array when no ingredients are found', async () => {
      mocks.mock.prisma.client.$queryRaw.mockResolvedValue([]);

      const response = await GET();
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: true,
        ingredients: [],
      });
      expect(response.status).toBe(200);
    });

    it('includes development error details in development mode', async () => {
      const originalEnv = mocks.mock.config.app.nodeEnv;
      mocks.mock.config.env.development();

      const error = new Error('Database connection failed');
      mocks.mock.prisma.client.$queryRaw.mockRejectedValue(error);

      const response = await GET();
      const responseData = await response.json();

      expect(responseData.details).toBe('Database connection failed');

      mocks.mock.config.env.restore(originalEnv);
    });
  });
});
