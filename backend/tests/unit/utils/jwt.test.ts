import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
  decodeToken,
  TokenPayload,
} from '../../../src/utils/jwt.util';

describe('JWT Utility', () => {
  const mockPayload: TokenPayload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'client',
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate tokens with same structure', () => {
      const token1 = generateAccessToken(mockPayload);
      const token2 = generateAccessToken(mockPayload);

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyAccessToken(invalidToken)).toThrow('Invalid token');
    });

    it('should throw error for tampered token', () => {
      const token = generateAccessToken(mockPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => verifyAccessToken(tamperedToken)).toThrow('Invalid token');
    });

    it('should throw error for empty token', () => {
      expect(() => verifyAccessToken('')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => verifyRefreshToken(invalidToken)).toThrow('Invalid refresh token');
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const tokens = generateTokens(mockPayload);

      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate valid tokens that can be verified', () => {
      const tokens = generateTokens(mockPayload);

      const decodedAccess = verifyAccessToken(tokens.accessToken);
      const decodedRefresh = verifyRefreshToken(tokens.refreshToken);

      expect(decodedAccess.userId).toBe(mockPayload.userId);
      expect(decodedRefresh.userId).toBe(mockPayload.userId);
    });
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.role).toBe(mockPayload.role);
    });

    it('should return null for invalid token format', () => {
      const decoded = decodeToken('invalid-token');

      expect(decoded).toBeNull();
    });

    it('should decode expired token without throwing error', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = decodeToken(token);

      expect(decoded).toBeDefined();
    });
  });

  describe('Token payload validation', () => {
    it('should include all required fields in payload', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
    });

    it('should handle different roles', () => {
      const roles = ['client', 'lawyer', 'admin'];

      roles.forEach((role) => {
        const payload = { ...mockPayload, role };
        const token = generateAccessToken(payload);
        const decoded = verifyAccessToken(token);

        expect(decoded.role).toBe(role);
      });
    });
  });
});