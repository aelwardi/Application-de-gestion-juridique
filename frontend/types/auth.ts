export interface User {
  id: string;
  email: string;
  role: 'admin' | 'avocat' | 'client' | 'collaborateur';
  firstName: string;
  lastName: string;
  phone?: string | null;
  profilePictureUrl?: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'avocat' | 'client' | 'collaborateur';
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePictureUrl?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

