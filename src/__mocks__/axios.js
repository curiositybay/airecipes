import mockAxios from 'jest-mock-axios';

// Mock the create method to return the same mock instance
mockAxios.create = jest.fn(() => mockAxios);

export default mockAxios;
