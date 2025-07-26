const mockSwal = {
  fire: jest.fn().mockResolvedValue({ isConfirmed: false }),
};

module.exports = mockSwal;
