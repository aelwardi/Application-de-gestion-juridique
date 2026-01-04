// =====================================================
// Types AUTH - Frontend adapté à la table users unifiée
// =====================================================

export type UserRole = 'admin' | 'avocat' | 'client' | 'collaborateur';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string | null;
  profilePictureUrl?: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Champs spécifiques avocats (si role='avocat')
  barNumber?: string | null;
  specialties?: string[];
  experienceYears?: number | null;
  officeAddress?: string | null;
  officeCity?: string | null;
  officePostalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hourlyRate?: number | null;
  description?: string | null;
  languages?: string[];
  availabilityStatus?: 'available' | 'busy' | 'unavailable' | null;
  verifiedByAdmin?: boolean;
  verifiedAt?: Date | null;
  rating?: number;
  totalReviews?: number;

  // Champs spécifiques clients (si role='client')
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;

  // Statistiques (commun avocats/clients)
  totalCases?: number;
  activeCases?: number;
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
  officePostalCode?: string;
  experienceYears?: number;
  description?: string;
  hourlyRate?: number;
  languages?: string[];
}

export interface ClientData {
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
  // Champs avocats
  officeAddress?: string;
  officeCity?: string;
  description?: string;
  hourlyRate?: number;
  availabilityStatus?: 'available' | 'busy' | 'unavailable';
  // Champs clients
  address?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

