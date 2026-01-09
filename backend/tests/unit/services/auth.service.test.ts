import * as authService from '../../../src/services/auth.service';
import * as authQueries from '../../../src/database/queries/auth.queries';
import * as twoFactorQueries from '../../../src/database/queries/two-factor.queries';
import * as passwordResetQueries from '../../../src/database/queries/password-reset.queries';
import * as passwordUtil from '../../../src/utils/password.util';
import * as emailUtil from '../../../src/utils/email.util';
import { mockUser, mockLawyer } from '../../helpers/mock-helpers';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../src/database/queries/auth.queries');
jest.mock('../../../src/database/queries/two-factor.queries');
jest.mock('../../../src/database/queries/password-reset.queries');
jest.mock('../../../src/utils/email.util');

describe('AuthService', () => {
  const mockAuthQueries = authQueries as jest.Mocked<typeof authQueries>;
  const mockTwoFactorQueries = twoFactorQueries as jest.Mocked<typeof twoFactorQueries>;
  const mockPasswordResetQueries = passwordResetQueries as jest.Mocked<typeof passwordResetQueries>;
  const mockEmailUtil = emailUtil as jest.Mocked<typeof emailUtil>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailUtil.sendWelcomeEmail.mockResolvedValue(undefined as any);
    mockEmailUtil.sendPasswordChangedEmail.mockResolvedValue(undefined as any);
    mockEmailUtil.sendPasswordResetEmail.mockResolvedValue(undefined as any);
    mockTwoFactorQueries.getTwoFactorStatus.mockResolvedValue({
      enabled: false,
      secret: null,
      backupCodes: [],
      verifiedAt: null,
    });
  });

  describe('register', () => {
    it('should register a new client successfully', async () => {
      const registerData = {
        email: 'newclient@test.com',
        password: 'Test123!',
        role: 'client' as const,
        firstName: 'New',
        lastName: 'Client',
        phone: '+1234567890',
      };

      const newUser = mockUser({
        email: registerData.email,
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        role: registerData.role,
      });

      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(null);
      mockAuthQueries.createUser.mockResolvedValueOnce(newUser);
      mockAuthQueries.userToResponse.mockReturnValueOnce({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
      } as any);
      mockAuthQueries.updateLastLogin.mockResolvedValueOnce(undefined);

      const result = await authService.register(registerData);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(registerData.email);
      expect(mockAuthQueries.findUserByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockAuthQueries.createUser).toHaveBeenCalled();
      expect(mockEmailUtil.sendWelcomeEmail).toHaveBeenCalled();
    });

    it('should register a new lawyer successfully', async () => {
      const registerData = {
        email: 'newlawyer@test.com',
        password: 'Test123!',
        role: 'avocat' as const,
        firstName: 'New',
        lastName: 'Lawyer',
        phone: '+1234567890',
        lawyerData: {
          barNumber: 'BAR123456',
          specialties: ['Droit civil'],
          officeAddress: '123 Test Street',
          hourlyRate: 150,
        },
      };

      const newLawyer = mockLawyer({
        email: registerData.email,
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        role: 'avocat',
      });

      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(null);
      mockAuthQueries.createUser.mockResolvedValueOnce(newLawyer);
      mockAuthQueries.userToResponse.mockReturnValueOnce({
        id: newLawyer.id,
        email: newLawyer.email,
        role: newLawyer.role,
        firstName: newLawyer.first_name,
        lastName: newLawyer.last_name,
      } as any);
      mockAuthQueries.updateLastLogin.mockResolvedValueOnce(undefined);

      const result = await authService.register(registerData);

      expect(result).toBeDefined();
      expect(result.user.role).toBe('avocat');
    });

    it('should throw error if email already exists', async () => {
      const registerData = {
        email: 'existing@test.com',
        password: 'Test123!',
        role: 'client' as const,
        firstName: 'Existing',
        lastName: 'User',
      };

      const existingUser = mockUser({ email: registerData.email });
      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(existingUser);

      await expect(authService.register(registerData)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(mockAuthQueries.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'Test123!',
      };

      const user = mockUser({
        email: loginData.email,
        is_active: true,
        password_hash: await passwordUtil.hashPassword(loginData.password),
      });

      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(user);
      mockAuthQueries.userToResponse.mockReturnValueOnce({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      } as any);
      mockAuthQueries.updateLastLogin.mockResolvedValueOnce(undefined);
      mockTwoFactorQueries.getTwoFactorStatus.mockResolvedValueOnce({
        enabled: false,
        secret: null,
        backupCodes: [],
        verifiedAt: null,
      });

      const result = await authService.login(loginData);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.requiresTwoFactor).toBe(false);
      expect(mockAuthQueries.updateLastLogin).toHaveBeenCalledWith(user.id);
    });

    it('should throw error if user not found', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'Test123!',
      };

      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw error if account is deactivated', async () => {
      const loginData = {
        email: 'deactivated@test.com',
        password: 'Test123!',
      };

      const user = mockUser({
        email: loginData.email,
        is_active: false,
      });

      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(user);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Account is deactivated. Please contact support.'
      );
    });

    it('should throw error if password is invalid', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'WrongPassword123!',
      };

      const user = mockUser({
        email: loginData.email,
        is_active: true,
        password_hash: await passwordUtil.hashPassword('CorrectPassword123!'),
      });

      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(user);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should return temp token when two-factor authentication is enabled', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'Test123!',
      };

      const user = mockUser({
        email: loginData.email,
        is_active: true,
        password_hash: await passwordUtil.hashPassword(loginData.password),
      });

      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(user);
      mockAuthQueries.userToResponse.mockReturnValueOnce({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      } as any);
      mockTwoFactorQueries.getTwoFactorStatus.mockResolvedValueOnce({
        enabled: true,
        secret: 'secret123',
        backupCodes: [],
        verifiedAt: new Date(),
      });

      const twoFactorService = require('../../../src/services/two-factor.service');
      jest.spyOn(twoFactorService, 'createLoginTempToken').mockResolvedValue('temp-token-123');

      const result = await authService.login(loginData);

      expect(result).toBeDefined();
      expect(result.requiresTwoFactor).toBe(true);
      expect(result.tempToken).toBe('temp-token-123');
      expect(result.accessToken).toBe('');
      expect(result.refreshToken).toBe('');
      expect(mockAuthQueries.updateLastLogin).not.toHaveBeenCalled();
    });
  });


  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = uuidv4();
      const changePasswordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      const user = mockUser({
        id: userId,
        password_hash: await passwordUtil.hashPassword(changePasswordData.currentPassword),
      });

      mockAuthQueries.findUserById.mockResolvedValueOnce(user);
      mockAuthQueries.updateUserPassword.mockResolvedValueOnce(undefined);

      await authService.changePassword(userId, changePasswordData);

      expect(mockAuthQueries.updateUserPassword).toHaveBeenCalled();
      expect(mockEmailUtil.sendPasswordChangedEmail).toHaveBeenCalledWith(
        user.email,
        user.first_name
      );
    });

    it('should throw error if current password is incorrect', async () => {
      const userId = uuidv4();
      const changePasswordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
      };

      const user = mockUser({
        id: userId,
        password_hash: await passwordUtil.hashPassword('CorrectPassword123!'),
      });

      mockAuthQueries.findUserById.mockResolvedValueOnce(user);

      await expect(
        authService.changePassword(userId, changePasswordData)
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw error if user not found', async () => {
      const userId = uuidv4();
      const changePasswordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      mockAuthQueries.findUserById.mockResolvedValueOnce(null);

      await expect(
        authService.changePassword(userId, changePasswordData)
      ).rejects.toThrow('User not found');
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email for existing user', async () => {
      const email = 'test@test.com';
      const user = mockUser({ email });

      const resetToken = {
        id: uuidv4(),
        user_id: user.id,
        token: 'reset-token-123',
        expires_at: new Date(Date.now() + 3600000),
        used: false,
        created_at: new Date(),
      };

      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(user);
      mockPasswordResetQueries.deleteUserTokens.mockResolvedValue(undefined as any);
      mockPasswordResetQueries.createPasswordResetToken.mockResolvedValue(resetToken as any);

      await authService.forgotPassword(email);

      expect(mockAuthQueries.findUserByEmail).toHaveBeenCalledWith(email);
      expect(mockPasswordResetQueries.deleteUserTokens).toHaveBeenCalledWith(user.id);
      expect(mockPasswordResetQueries.createPasswordResetToken).toHaveBeenCalledWith(user.id, 1);
      expect(mockEmailUtil.sendPasswordResetEmail).toHaveBeenCalledWith(
        user.email,
        'reset-token-123',
        user.first_name
      );
    });

    it('should not throw error for non-existent user', async () => {
      const email = 'nonexistent@test.com';

      mockAuthQueries.findUserByEmail.mockResolvedValueOnce(null);

      await expect(authService.forgotPassword(email)).resolves.not.toThrow();
      expect(mockEmailUtil.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewPassword123!';
      const user = mockUser();

      const resetToken = {
        id: uuidv4(),
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + 3600000),
        used: false,
        created_at: new Date(),
      };

      mockPasswordResetQueries.findPasswordResetToken.mockResolvedValue(resetToken as any);
      mockPasswordResetQueries.markTokenAsUsed.mockResolvedValue(undefined as any);
      mockAuthQueries.findUserById.mockResolvedValueOnce(user);
      mockAuthQueries.updateUserPassword.mockResolvedValueOnce(undefined as any);

      await authService.resetPassword(token, newPassword);

      expect(mockPasswordResetQueries.findPasswordResetToken).toHaveBeenCalledWith(token);
      expect(mockAuthQueries.updateUserPassword).toHaveBeenCalled();
      expect(mockPasswordResetQueries.markTokenAsUsed).toHaveBeenCalledWith(token);
      expect(mockEmailUtil.sendPasswordChangedEmail).toHaveBeenCalledWith(
        user.email,
        user.first_name
      );
    });

    it('should throw error for invalid token', async () => {
      const token = 'invalid-token';
      const newPassword = 'NewPassword123!';

      mockPasswordResetQueries.findPasswordResetToken.mockResolvedValue(null);

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });

    it('should throw error if user not found', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewPassword123!';

      const resetToken = {
        id: uuidv4(),
        user_id: uuidv4(),
        token,
        expires_at: new Date(Date.now() + 3600000),
        used: false,
        created_at: new Date(),
      };

      mockPasswordResetQueries.findPasswordResetToken.mockResolvedValue(resetToken as any);
      mockAuthQueries.findUserById.mockResolvedValueOnce(null);

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = uuidv4();
      const user = mockUser({ id: userId });

      mockAuthQueries.findUserById.mockResolvedValueOnce(user);
      mockAuthQueries.userToResponse.mockReturnValueOnce({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      } as any);

      const result = await authService.getProfile(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(mockAuthQueries.findUserById).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      const userId = uuidv4();

      mockAuthQueries.findUserById.mockResolvedValueOnce(null);

      await expect(authService.getProfile(userId)).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = uuidv4();
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+9876543210',
      };

      const user = mockUser({ id: userId });
      const updatedUser = mockUser({ ...user, ...updateData });

      mockAuthQueries.findUserById.mockResolvedValueOnce(user);
      mockAuthQueries.updateUserProfile.mockResolvedValueOnce(updatedUser);
      mockAuthQueries.userToResponse.mockReturnValueOnce({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
      } as any);

      const result = await authService.updateProfile(userId, updateData);

      expect(result).toBeDefined();
      expect(mockAuthQueries.updateUserProfile).toHaveBeenCalledWith(userId, {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone,
        profilePictureUrl: undefined,
      });
    });

    it('should throw error if user not found', async () => {
      const userId = uuidv4();
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      mockAuthQueries.findUserById.mockResolvedValueOnce(null);

      await expect(authService.updateProfile(userId, updateData)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const userId = uuidv4();
      const user = mockUser({ id: userId, is_active: true });
      const oldRefreshToken = 'old-refresh-token';

      const jwtUtil = require('../../../src/utils/jwt.util');
      jest.spyOn(jwtUtil, 'verifyRefreshToken').mockReturnValue({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      mockAuthQueries.findUserById.mockResolvedValueOnce(user);

      const result = await authService.refreshAccessToken(oldRefreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for invalid refresh token', async () => {
      const invalidToken = 'invalid-token';

      const jwtUtil = require('../../../src/utils/jwt.util');
      jest.spyOn(jwtUtil, 'verifyRefreshToken').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshAccessToken(invalidToken)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should throw error if user not found', async () => {
      const userId = uuidv4();
      const refreshToken = 'valid-refresh-token';

      const jwtUtil = require('../../../src/utils/jwt.util');
      jest.spyOn(jwtUtil, 'verifyRefreshToken').mockReturnValue({
        userId,
        email: 'test@test.com',
        role: 'client',
      });

      mockAuthQueries.findUserById.mockResolvedValueOnce(null);

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should throw error if user is deactivated', async () => {
      const userId = uuidv4();
      const user = mockUser({ id: userId, is_active: false });
      const refreshToken = 'valid-refresh-token';

      const jwtUtil = require('../../../src/utils/jwt.util');
      const mockVerify = jest.spyOn(jwtUtil, 'verifyRefreshToken').mockReturnValue({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      mockAuthQueries.findUserById.mockResolvedValueOnce(user);

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        'Invalid or expired refresh token'
      );

      mockVerify.mockRestore();
    });
  });
});