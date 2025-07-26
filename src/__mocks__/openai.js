const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
  models: {
    list: jest.fn(),
  },
};

const OpenAI = jest.fn(() => mockOpenAI);

module.exports = {
  default: OpenAI,
  mockOpenAI,
};
