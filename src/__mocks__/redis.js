const mockRedisClient = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

const createClient = jest.fn(() => mockRedisClient);

module.exports = {
  createClient,
  mockRedisClient,
};
