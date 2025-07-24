import {
  mockPrismaClient,
  mockNextResponse,
  mockLogger,
  mockValidation,
  mockPrisma,
  mockNext,
  mockLoggerModule,
  mockValidationModule,
  setupApiMocks,
  clearApiMocks,
} from './mocks';

describe('mocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mockPrismaClient', () => {
    it('should have all required Prisma methods', () => {
      expect(mockPrismaClient.example).toBeDefined();
      expect(mockPrismaClient.example.findMany).toBeDefined();
      expect(mockPrismaClient.example.create).toBeDefined();
      expect(mockPrismaClient.example.update).toBeDefined();
      expect(mockPrismaClient.example.delete).toBeDefined();
      expect(mockPrismaClient.example.findUnique).toBeDefined();
      expect(mockPrismaClient.example.findFirst).toBeDefined();
      expect(mockPrismaClient.example.count).toBeDefined();
    });

    it('should have usageLog methods', () => {
      expect(mockPrismaClient.usageLog).toBeDefined();
      expect(mockPrismaClient.usageLog.findMany).toBeDefined();
      expect(mockPrismaClient.usageLog.create).toBeDefined();
    });

    it('should have ingredient methods', () => {
      expect(mockPrismaClient.ingredient).toBeDefined();
      expect(mockPrismaClient.ingredient.findMany).toBeDefined();
      expect(mockPrismaClient.ingredient.create).toBeDefined();
    });

    it('should have transaction methods', () => {
      expect(mockPrismaClient.$connect).toBeDefined();
      expect(mockPrismaClient.$disconnect).toBeDefined();
      expect(mockPrismaClient.$transaction).toBeDefined();
      expect(mockPrismaClient.$queryRaw).toBeDefined();
    });
  });

  describe('mockNextResponse', () => {
    it('should create response with default status', () => {
      const response = mockNextResponse.json({ success: true }, undefined);
      expect(response.status).toBe(200);
    });

    it('should create response with custom status', () => {
      const response = mockNextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
      expect(response.status).toBe(404);
    });
  });

  describe('mockLogger', () => {
    it('should have all logger methods', () => {
      expect(mockLogger.error).toBeDefined();
      expect(mockLogger.info).toBeDefined();
      expect(mockLogger.warn).toBeDefined();
      expect(mockLogger.debug).toBeDefined();
      expect(mockLogger.http).toBeDefined();
      expect(mockLogger.verbose).toBeDefined();
      expect(mockLogger.silly).toBeDefined();
    });
  });

  describe('mockValidation', () => {
    it('should have validation methods', () => {
      expect(mockValidation.validateRequest).toBeDefined();
      expect(mockValidation.createExampleSchema).toBeDefined();
      expect(mockValidation.updateExampleSchema).toBeDefined();
      expect(mockValidation.createUsageLogSchema).toBeDefined();
    });
  });

  describe('mock functions', () => {
    it('should have mockPrisma function', () => {
      expect(typeof mockPrisma).toBe('function');
    });

    it('should have mockNext function', () => {
      expect(typeof mockNext).toBe('function');
    });

    it('should have mockLoggerModule function', () => {
      expect(typeof mockLoggerModule).toBe('function');
    });

    it('should have mockValidationModule function', () => {
      expect(typeof mockValidationModule).toBe('function');
    });
  });

  describe('setupApiMocks', () => {
    it('should be a function', () => {
      expect(typeof setupApiMocks).toBe('function');
    });
  });

  describe('clearApiMocks', () => {
    it('should clear mocks and return true', () => {
      const result = clearApiMocks();
      expect(result).toBe(true);
    });
  });
});
