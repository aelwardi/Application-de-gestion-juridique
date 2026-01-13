export const mockTokens = {
  accessToken: 'mock-access-token-123',
  refreshToken: 'mock-refresh-token-456',
};

export const mockTokenPayload = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  role: 'client' as const,
};

export const mockJwtUtil = {
  generateTokens: jest.fn().mockReturnValue(mockTokens),
  verifyAccessToken: jest.fn().mockReturnValue(mockTokenPayload),
  verifyRefreshToken: jest.fn().mockReturnValue(mockTokenPayload),
  generateAccessToken: jest.fn().mockReturnValue(mockTokens.accessToken),
  generateRefreshToken: jest.fn().mockReturnValue(mockTokens.refreshToken),
};

export const resetJwtMocks = () => {
  Object.values(mockJwtUtil).forEach((mock) => {
    if (typeof mock.mockReset === 'function') {
      mock.mockReset();
    }
  });
};
