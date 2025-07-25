export const mockValidation = {
  validateRequest: jest.fn(),
  createExampleSchema: {},
  updateExampleSchema: {},
  createUsageLogSchema: {},
};

export const mockValidationModule = () => {
  jest.mock('@/lib/validation', () => mockValidation);
};

export const setupValidationMocks = () => {
  mockValidationModule();
};
