export const mockPasswordUtil = {
  hashPassword: jest.fn().mockResolvedValue('$2b$10$mockedHashedPassword'),
  comparePassword: jest.fn().mockResolvedValue(true),
};

export const resetPasswordMocks = () => {
  mockPasswordUtil.hashPassword.mockReset().mockResolvedValue('$2b$10$mockedHashedPassword');
  mockPasswordUtil.comparePassword.mockReset().mockResolvedValue(true);
};

