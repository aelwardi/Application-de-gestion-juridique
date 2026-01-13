export const mockUser = {
  id: 'user-1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'client' as const,
  isActive: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAuthResponse = {
  success: true,
  message: 'Authentication successful',
  data: {
    user: mockUser,
    accessToken: 'mock-access-token-123',
    refreshToken: 'mock-refresh-token-456',
  },
};

export const mockRegisterData = {
  email: 'john@example.com',
  password: 'Password123!',
  firstName: 'John',
  lastName: 'Doe',
  role: 'client' as const,
};

export const mockLoginData = {
  email: 'john@example.com',
  password: 'Password123!',
};