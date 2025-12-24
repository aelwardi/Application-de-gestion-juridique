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
  lawyerId?: string | null; // ID de la table lawyers (pour les avocats)
  clientId?: string | null; // ID de la table clients (pour les clients)
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

export interface LawyerData {
  barNumber: string;
  specialties?: string[];
  officeAddress?: string;
  officeCity?: string;
  yearsOfExperience?: number;
  bio?: string;
}

export interface ClientData {
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'avocat' | 'client' | 'collaborateur';
  phone?: string;
  lawyerData?: LawyerData;
  clientData?: ClientData;
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

