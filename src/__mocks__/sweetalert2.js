const mockSwal = {
  fire: jest.fn().mockResolvedValue({ isConfirmed: false }),
};

const mockThemedSwal = {
  confirm: jest.fn().mockResolvedValue({ isConfirmed: false }),
  info: jest.fn().mockResolvedValue({ isConfirmed: true }),
  success: jest.fn().mockResolvedValue({ isConfirmed: true }),
  warning: jest.fn().mockResolvedValue({ isConfirmed: true }),
  error: jest.fn().mockResolvedValue({ isConfirmed: true }),
  custom: jest.fn().mockResolvedValue({ isConfirmed: true }),
};

module.exports = mockSwal;
module.exports.themedSwal = mockThemedSwal;
