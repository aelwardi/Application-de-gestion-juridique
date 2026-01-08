export type UserRole = "admin" | "avocat" | "client" | "collaborateur";

export interface BaseUser {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string | null;
  profile_picture_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface LawyerFields {
  bar_number: string;
  specialties?: string[];
  experience_years?: number;
  office_address?: string | null;
  office_city?: string | null;
  office_postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hourly_rate?: number | null;
  description?: string | null;
  languages?: string[];
  availability_status?: 'available' | 'busy' | 'unavailable' | null;
  verified_by_admin?: boolean;
  verified_at?: Date | null;
  rating?: number;
  total_reviews?: number;
  total_cases?: number;
  active_cases?: number;
}

export interface ClientFields {
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
  total_cases?: number;
  active_cases?: number;
}

export interface User extends BaseUser {
  bar_number?: string | null;
  specialties?: string[];
  experience_years?: number | null;
  office_address?: string | null;
  office_city?: string | null;
  office_postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hourly_rate?: number | null;
  description?: string | null;
  languages?: string[];
  availability_status?: 'available' | 'busy' | 'unavailable' | null;
  verified_by_admin?: boolean;
  verified_at?: Date | null;
  rating?: number;
  total_reviews?: number;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
  total_cases?: number;
  active_cases?: number;
}

export interface Lawyer extends BaseUser, LawyerFields {
  role: 'avocat';
}

export interface Client extends BaseUser {
  role: 'client';
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
  total_cases?: number;
  active_cases?: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture_url?: string;
}

export interface CreateLawyerInput extends CreateUserInput {
  role: 'avocat';
  bar_number: string;
  specialties?: string[];
  experience_years?: number;
  office_address?: string;
  office_city?: string;
  office_postal_code?: string;
  latitude?: number;
  longitude?: number;
  hourly_rate?: number;
  description?: string;
  languages?: string[];
}

export interface CreateClientInput extends CreateUserInput {
  role: 'client';
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface UpdateUserInput {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture_url?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface UpdateLawyerInput extends UpdateUserInput {
  bar_number?: string;
  specialties?: string[];
  experience_years?: number;
  office_address?: string;
  office_city?: string;
  office_postal_code?: string;
  latitude?: number;
  longitude?: number;
  hourly_rate?: number;
  description?: string;
  languages?: string[];
  availability_status?: 'available' | 'busy' | 'unavailable';
}

export interface UpdateClientInput extends UpdateUserInput {
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string | null;
  profile_picture_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  bar_number?: string | null;
  specialties?: string[];
  office_city?: string | null;
  rating?: number;
  total_reviews?: number;
  verified_by_admin?: boolean;
  city?: string | null;
  total_cases?: number;
  active_cases?: number;
}

export interface UserSearchFilters {
  role?: UserRole;
  email?: string;
  name?: string;
  is_active?: boolean;
  is_verified?: boolean;
  limit?: number;
  offset?: number;
}

export interface LawyerSearchFilters {
  verified?: boolean;
  city?: string;
  specialty?: string;
  min_rating?: number;
  availability_status?: 'available' | 'busy' | 'unavailable';
  name?: string;
  limit?: number;
  offset?: number;
}

export interface ClientSearchFilters {
  name?: string;
  email?: string;
  city?: string;
  has_active_cases?: boolean;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}