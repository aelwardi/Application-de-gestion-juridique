import * as authService from '../../../src/services/auth.service';
import * as authQueries from '../../../src/database/queries/auth.queries';
import * as passwordUtil from '../../../src/utils/password.util';
import * as emailUtil from '../../../src/utils/email.util';
import { mockUser, mockLawyer } from '../../helpers/mock-helpers';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../src/database/queries/auth.queries');
jest.mock('../../../src/utils/email.util');

describe('AuthService', () => {
  const mockAuthQueries = authQueries as jest.Mocked<typeof authQueries>;
  const mockEmailUtil = emailUtil as jest.Mocked<typeof emailUtil>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailUtil.sendWelcomeEmail.mockResolvedValue(undefined as any);
    mockEmailUtil.sendPasswordChangedEmail.mockResolvedValue(undefined as any);
    mockEmailUtil.sendPasswordResetEmail.mockResolvedValue(undefined as any);
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

      const result = await authService.login(loginData);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
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
});