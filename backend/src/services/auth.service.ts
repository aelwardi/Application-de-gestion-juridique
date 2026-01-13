import {
  createUser,
  findUserByEmail,
  findUserById,
  updateLastLogin,
  updateUserPassword,
  updateUserProfile,
  userToResponse,
  UserResponse
} from '../database/queries/auth.queries';
import {
  createPasswordResetToken,
  findPasswordResetToken,
  markTokenAsUsed,
  deleteUserTokens
} from '../database/queries/password-reset.queries';
import { getTwoFactorStatus } from '../database/queries/two-factor.queries';
import { createLoginTempToken } from './two-factor.service';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateTokens, verifyRefreshToken, TokenPayload } from '../utils/jwt.util';
import { sendWelcomeEmail, sendPasswordChangedEmail, sendPasswordResetEmail } from '../utils/email.util';
import {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from '../validators/auth.validator';

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

/**
 * Helper pour formater UserResponse
 * Note: Avec la table unifiée, l'ID user est suffisant (pas besoin de lawyerId/clientId séparés)
 */
const formatUserResponse = (userResponse: UserResponse): UserResponse => {
  return userResponse;
};

/**
 * Register a new user
 */
export const register = async (data: RegisterInput): Promise<AuthResponse> => {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await createUser(
    data.email,
    passwordHash,
    data.role,
    data.firstName,
    data.lastName,
    data.phone,
    data.lawyerData,
    data.clientData
  );

  sendWelcomeEmail(user.email, user.first_name, user.last_name).catch(err => {
    console.error('Failed to send welcome email:', err);
  });

  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const tokens = generateTokens(tokenPayload);

  await updateLastLogin(user.id);

  const userResponse = formatUserResponse(userToResponse(user));

  return {
    user: userResponse,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

/**
 * Login user
 */
export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const user = await findUserByEmail(data.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.is_active) {
    throw new Error('Account is deactivated. Please contact support.');
  }

  const isPasswordValid = await comparePassword(data.password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const twoFactorStatus = await getTwoFactorStatus(user.id);

  if (twoFactorStatus.enabled) {
    const tempToken = await createLoginTempToken(user.id);

    const userResponse = formatUserResponse(userToResponse(user));
    return {
      user: userResponse,
      accessToken: '',
      refreshToken: '',
      requiresTwoFactor: true,
      tempToken,
    };
  }

  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const tokens = generateTokens(tokenPayload);

  await updateLastLogin(user.id);

  const userResponse = formatUserResponse(userToResponse(user));

  return {
    user: userResponse,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    requiresTwoFactor: false,
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await findUserById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    return tokens;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Get user profile
 */
export const getProfile = async (userId: string): Promise<UserResponse> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const userResponse = formatUserResponse(userToResponse(user));
  return userResponse;
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, data: UpdateProfileInput): Promise<UserResponse> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const updatedUser = await updateUserProfile(userId, {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    profilePictureUrl: data.profilePictureUrl,
  });

  return formatUserResponse(userToResponse(updatedUser));
};

/**
 * Change password
 */
export const changePassword = async (userId: string, data: ChangePasswordInput): Promise<void> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await comparePassword(data.currentPassword, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  const newPasswordHash = await hashPassword(data.newPassword);

  await updateUserPassword(userId, newPasswordHash);

  sendPasswordChangedEmail(user.email, user.first_name).catch(err => {
    console.error('Failed to send password changed email:', err);
  });
};

/**
 * Request password reset
 */
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await findUserByEmail(email);

  if (!user) {
    return;
  }

  await deleteUserTokens(user.id);

  const resetToken = await createPasswordResetToken(user.id, 1);

  sendPasswordResetEmail(user.email, user.first_name, resetToken.token).catch(err => {
    console.error('Failed to send password reset email:', err);
  });
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const resetToken = await findPasswordResetToken(token);

  if (!resetToken) {
    throw new Error('Invalid or expired reset token');
  }

  const user = await findUserById(resetToken.user_id);

  if (!user) {
    throw new Error('User not found');
  }

  const newPasswordHash = await hashPassword(newPassword);

  await updateUserPassword(user.id, newPasswordHash);

  await markTokenAsUsed(token);

  sendPasswordChangedEmail(user.email, user.first_name).catch(err => {
    console.error('Failed to send password changed email:', err);
  });
};