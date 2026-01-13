import * as authService from '../../../src/services/auth.service';
import * as authQueries from '../../../src/database/queries/auth.queries';
import * as passwordResetQueries from '../../../src/database/queries/password-reset.queries';
import * as twoFactorQueries from '../../../src/database/queries/two-factor.queries';
import * as passwordUtil from '../../../src/utils/password.util';
import * as jwtUtil from '../../../src/utils/jwt.util';
import * as emailUtil from '../../../src/utils/email.util';
import * as twoFactorService from '../../../src/services/two-factor.service';
import {
  mockUser,
  mockUserResponse,
  mockRegisterInput,
  mockLoginInput,
} from '../../fixtures/user.fixture';
import { mockTokens, mockTokenPayload } from '../../mocks/jwt.mock';

jest.mock('../../../src/database/queries/auth.queries');
jest.mock('../../../src/database/queries/password-reset.queries');
jest.mock('../../../src/database/queries/two-factor.queries');
jest.mock('../../../src/utils/password.util');
jest.mock('../../../src/utils/jwt.util');
jest.mock('../../../src/utils/email.util');
jest.mock('../../../src/services/two-factor.service');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
      (authQueries.createUser as jest.Mock).mockResolvedValue(mockUser);
      (authQueries.userToResponse as jest.Mock).mockReturnValue(mockUserResponse);
      (jwtUtil.generateTokens as jest.Mock).mockReturnValue(mockTokens);
      (authQueries.updateLastLogin as jest.Mock).mockResolvedValue(undefined);
      (emailUtil.sendWelcomeEmail as jest.Mock).mockResolvedValue(true);

      const result = await authService.register(mockRegisterInput);

      expect(authQueries.findUserByEmail).toHaveBeenCalledWith(mockRegisterInput.email);
      expect(passwordUtil.hashPassword).toHaveBeenCalledWith(mockRegisterInput.password);
      expect(authQueries.createUser).toHaveBeenCalledWith(
        mockRegisterInput.email,
        'hashedPassword123',
        mockRegisterInput.role,
        mockRegisterInput.firstName,
        mockRegisterInput.lastName,
        mockRegisterInput.phone,
        undefined,
        undefined
      );
      expect(jwtUtil.generateTokens).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(authQueries.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        user: mockUserResponse,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
    });

    it('devrait lever une erreur si l\'email existe déjà', async () => {
      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.register(mockRegisterInput)).rejects.toThrow(
        'User with this email already exists'
      );
      expect(passwordUtil.hashPassword).not.toHaveBeenCalled();
      expect(authQueries.createUser).not.toHaveBeenCalled();
    });

    it('devrait envoyer un email de bienvenue (en background)', async () => {
      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
      (authQueries.createUser as jest.Mock).mockResolvedValue(mockUser);
      (authQueries.userToResponse as jest.Mock).mockReturnValue(mockUserResponse);
      (jwtUtil.generateTokens as jest.Mock).mockReturnValue(mockTokens);
      (authQueries.updateLastLogin as jest.Mock).mockResolvedValue(undefined);
      (emailUtil.sendWelcomeEmail as jest.Mock).mockResolvedValue(true);

      await authService.register(mockRegisterInput);

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(emailUtil.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.first_name,
        mockUser.last_name
      );
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(true);
      (twoFactorQueries.getTwoFactorStatus as jest.Mock).mockResolvedValue({
        enabled: false,
        secret: null,
      });
      (authQueries.userToResponse as jest.Mock).mockReturnValue(mockUserResponse);
      (jwtUtil.generateTokens as jest.Mock).mockReturnValue(mockTokens);
      (authQueries.updateLastLogin as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.login(mockLoginInput);

      expect(authQueries.findUserByEmail).toHaveBeenCalledWith(mockLoginInput.email);
      expect(passwordUtil.comparePassword).toHaveBeenCalledWith(
        mockLoginInput.password,
        mockUser.password_hash
      );
      expect(jwtUtil.generateTokens).toHaveBeenCalled();
      expect(authQueries.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        user: mockUserResponse,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        requiresTwoFactor: false,
      });
    });

    it('devrait lever une erreur si l\'email n\'existe pas', async () => {
      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(mockLoginInput)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(passwordUtil.comparePassword).not.toHaveBeenCalled();
    });

    it('devrait lever une erreur si le mot de passe est incorrect', async () => {
      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(mockLoginInput)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(jwtUtil.generateTokens).not.toHaveBeenCalled();
    });

    it('devrait retourner requiresTwoFactor si 2FA est activé', async () => {
      const userWith2FA = { ...mockUser, two_factor_enabled: true };
      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(userWith2FA);
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(true);
      (twoFactorQueries.getTwoFactorStatus as jest.Mock).mockResolvedValue({
        enabled: true,
        secret: 'secret123',
      });
      (authQueries.userToResponse as jest.Mock).mockReturnValue(mockUserResponse);
      (twoFactorService.createLoginTempToken as jest.Mock).mockResolvedValue('temp-token-123');

      const result = await authService.login(mockLoginInput);

      expect(result).toEqual({
        user: mockUserResponse,
        accessToken: '',
        refreshToken: '',
        requiresTwoFactor: true,
        tempToken: 'temp-token-123',
      });
      expect(authQueries.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('devrait générer de nouveaux tokens avec un refresh token valide', async () => {
      const refreshToken = 'valid-refresh-token';
      (jwtUtil.verifyRefreshToken as jest.Mock).mockReturnValue(mockTokenPayload);
      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (authQueries.userToResponse as jest.Mock).mockReturnValue(mockUserResponse);
      (jwtUtil.generateTokens as jest.Mock).mockReturnValue(mockTokens);

      const result = await authService.refreshAccessToken(refreshToken);

      expect(jwtUtil.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(authQueries.findUserById).toHaveBeenCalledWith(mockTokenPayload.userId);
      expect(jwtUtil.generateTokens).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
    });

    it('devrait lever une erreur si le refresh token est invalide', async () => {
      const invalidToken = 'invalid-token';
      (jwtUtil.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshAccessToken(invalidToken)).rejects.toThrow();
    });
  });
});