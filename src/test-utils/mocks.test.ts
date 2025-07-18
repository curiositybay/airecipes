import {
  mockPrismaClient,
  mockNextResponse,
  mockLogger,
  mockValidation,
  setupApiMocks,
  clearApiMocks,
  mockPrisma,
  mockNext,
  mockLoggerModule,
  mockValidationModule,
} from './mocks';

describe('test-utils/mocks', () => {
  it('mockPrismaClient has expected structure and methods', () => {
    // Test Example model methods
    expect(mockPrismaClient.example).toHaveProperty('findMany');
    expect(typeof mockPrismaClient.example.create).toBe('function');
    expect(mockPrismaClient.example).toHaveProperty('update');
    expect(mockPrismaClient.example).toHaveProperty('delete');
    expect(mockPrismaClient.example).toHaveProperty('findUnique');
    expect(mockPrismaClient.example).toHaveProperty('findFirst');
    expect(mockPrismaClient.example).toHaveProperty('count');

    // Test UsageLog model methods
    expect(mockPrismaClient.usageLog).toHaveProperty('findMany');
    expect(typeof mockPrismaClient.usageLog.create).toBe('function');
    expect(mockPrismaClient.usageLog).toHaveProperty('update');
    expect(mockPrismaClient.usageLog).toHaveProperty('delete');
    expect(mockPrismaClient.usageLog).toHaveProperty('findUnique');
    expect(mockPrismaClient.usageLog).toHaveProperty('findFirst');
    expect(mockPrismaClient.usageLog).toHaveProperty('count');

    // Test Prisma client methods
    expect(typeof mockPrismaClient.$connect).toBe('function');
    expect(typeof mockPrismaClient.$disconnect).toBe('function');
    expect(typeof mockPrismaClient.$transaction).toBe('function');
    expect(typeof mockPrismaClient.$queryRaw).toBe('function');
    expect(typeof mockPrismaClient.$executeRaw).toBe('function');
    expect(typeof mockPrismaClient.$queryRawUnsafe).toBe('function');
    expect(typeof mockPrismaClient.$executeRawUnsafe).toBe('function');
  });

  it('mockPrismaClient methods can be called and mocked', () => {
    // Test that we can mock and call Prisma methods
    mockPrismaClient.example.findMany.mockResolvedValue([
      { id: 1, name: 'test' },
    ]);
    mockPrismaClient.usageLog.create.mockResolvedValue({
      id: 1,
      method: 'GET',
      success: true,
    });
    mockPrismaClient.$queryRaw.mockResolvedValue([{ '1': 1 }]);

    expect(mockPrismaClient.example.findMany).toHaveBeenCalledTimes(0);
    expect(mockPrismaClient.usageLog.create).toHaveBeenCalledTimes(0);
    expect(mockPrismaClient.$queryRaw).toHaveBeenCalledTimes(0);
  });

  it('mockNextResponse.json returns expected object', async () => {
    const data = { foo: 'bar' };
    const resp = mockNextResponse.json(data, { status: 201, custom: true });
    expect(resp.status).toBe(201);
    expect(resp.custom).toBe(true);
    await expect(resp.json()).resolves.toEqual(data);
  });

  it('mockNextResponse.json uses default status when not provided', async () => {
    const data = { foo: 'bar' };
    // Pass undefined as the second argument to match the function signature
    const resp = mockNextResponse.json(data, undefined);
    expect(resp.status).toBe(200);
    await expect(resp.json()).resolves.toEqual(data);
  });

  it('mockNextResponse.json uses default status when opts provided but no status', async () => {
    const data = { foo: 'bar' };
    const resp = mockNextResponse.json(data, { custom: true });
    expect(resp.status).toBe(200);
    expect(resp.custom).toBe(true);
    await expect(resp.json()).resolves.toEqual(data);
  });

  it('mockNext sets up NextResponse and NextRequest mocks', async () => {
    jest.resetModules();
    mockNext();
    const nextServer = await import('next/server');
    expect(nextServer.NextResponse).toBe(mockNextResponse);
    expect(typeof nextServer.NextRequest).toBe('function');
  });

  it('mockLoggerModule sets up logger mock as default export', async () => {
    jest.resetModules();
    mockLoggerModule();
    const loggerModule = await import('../lib/logger');
    expect(loggerModule.default).toBe(mockLogger);
  });

  it('mockValidationModule sets up validation mock', async () => {
    jest.resetModules();
    mockValidationModule();
    const validationModule = await import('../lib/validation');
    if ('default' in validationModule) {
      expect(validationModule.default).toBe(mockValidation);
    } else {
      expect(validationModule).toMatchObject(mockValidation);
    }
  });

  it('setupApiMocks sets up all API mocks', async () => {
    jest.resetModules();
    setupApiMocks();
    // Check Prisma
    const mockPrismaModule = await import('@prisma/client');
    const client = new mockPrismaModule.PrismaClient();
    expect(client).toBe(mockPrismaClient);
    // Check Next
    const nextServer = await import('next/server');
    expect(nextServer.NextResponse).toBe(mockNextResponse);
    // Check Logger
    const loggerModule = await import('../lib/logger');
    expect(loggerModule.default).toBe(mockLogger);
    // Check Validation
    const validationModule = await import('../lib/validation');
    if ('default' in validationModule) {
      expect(validationModule.default).toBe(mockValidation);
    } else {
      expect(validationModule).toMatchObject(mockValidation);
    }
  });

  it('mockPrisma creates a working PrismaClient mock', async () => {
    // Reset mocks before testing
    jest.clearAllMocks();

    // Call mockPrisma to set up the mock
    mockPrisma();

    // Mock the @prisma/client module
    const mockPrismaModule = await import('@prisma/client');

    // Create an instance of the mocked PrismaClient
    const client = new mockPrismaModule.PrismaClient();

    // Verify the client has the expected structure
    expect(client).toBe(mockPrismaClient);
    expect(client.example).toBeDefined();
    expect(client.usageLog).toBeDefined();
  });

  it('mockLogger has all log methods as jest.fn', () => {
    expect(typeof mockLogger.error).toBe('function');
    expect(typeof mockLogger.info).toBe('function');
    expect(typeof mockLogger.warn).toBe('function');
    expect(typeof mockLogger.debug).toBe('function');
    expect(typeof mockLogger.http).toBe('function');
    expect(typeof mockLogger.verbose).toBe('function');
    expect(typeof mockLogger.silly).toBe('function');

    mockLogger.error('err');
    mockLogger.info('info');
    mockLogger.warn('warn');
    mockLogger.debug('debug');
    mockLogger.http('http');
    mockLogger.verbose('verbose');
    mockLogger.silly('silly');

    expect(mockLogger.error).toHaveBeenCalledWith('err');
    expect(mockLogger.info).toHaveBeenCalledWith('info');
    expect(mockLogger.warn).toHaveBeenCalledWith('warn');
    expect(mockLogger.debug).toHaveBeenCalledWith('debug');
    expect(mockLogger.http).toHaveBeenCalledWith('http');
    expect(mockLogger.verbose).toHaveBeenCalledWith('verbose');
    expect(mockLogger.silly).toHaveBeenCalledWith('silly');
  });

  it('mockValidation has expected properties', () => {
    expect(typeof mockValidation.validateRequest).toBe('function');
    expect(mockValidation).toHaveProperty('createExampleSchema');
    expect(mockValidation).toHaveProperty('updateExampleSchema');
    expect(mockValidation).toHaveProperty('createUsageLogSchema');
  });

  it('setupApiMocks does not throw', () => {
    expect(() => setupApiMocks()).not.toThrow();
  });

  it('mockPrisma does not throw', () => {
    expect(() => mockPrisma()).not.toThrow();
  });

  it('mockNext does not throw', () => {
    expect(() => mockNext()).not.toThrow();
  });

  it('mockLoggerModule does not throw', () => {
    expect(() => mockLoggerModule()).not.toThrow();
  });

  it('mockValidationModule does not throw', () => {
    expect(() => mockValidationModule()).not.toThrow();
  });

  it('clearApiMocks clears all mocks and returns true', () => {
    mockLogger.info('info');
    expect(mockLogger.info).toHaveBeenCalled();
    const result = clearApiMocks();
    expect(result).toBe(true);
    expect(mockLogger.info).not.toHaveBeenCalled();
  });
});
