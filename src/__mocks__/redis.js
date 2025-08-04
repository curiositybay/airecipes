const mockRedisClient = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  ping: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  keys: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  quit: jest.fn(),
};

const createClient = jest.fn(() => mockRedisClient);

// Mock the testRedisConnection function
const testRedisConnection = jest.fn().mockResolvedValue(false);

module.exports = {
  createClient,
  mockRedisClient,
  testRedisConnection,
};
