// =====================================================
// Types pour les AVOCATS (référence users.types.ts)
// Note: Lawyer est maintenant un type dans users.types.ts
// =====================================================

import { Lawyer, LawyerSearchFilters as BaseLawyerSearchFilters } from './users.types';

// Ré-export pour compatibilité
export type { Lawyer };

// Avocat avec informations complètes
export interface LawyerWithStats extends Lawyer {
  pending_cases?: number;
  completed_cases?: number;
  upcoming_appointments?: number;
  total_clients?: number;
  average_case_duration?: number;
}

// Ré-export des filtres
export type LawyerSearchFilters = BaseLawyerSearchFilters;

// Filtres géographiques pour recherche d'avocats
export interface LawyerNearbySearchFilters {
  latitude: number;
  longitude: number;
  radius_km?: number; // Par défaut 50km
  verified_only?: boolean;
  specialty?: string;
  min_rating?: number;
  limit?: number;
  offset?: number;
}

// Statistiques détaillées de l'avocat
export interface LawyerStats {
  total_cases: number;
  active_cases: number;
  completed_cases: number;
  pending_cases: number;
  total_clients: number;
  total_reviews: number;
  rating: number;
  upcoming_appointments: number;
  total_documents?: number;
  total_earnings?: number;
  average_case_duration?: number;
}

// Response pour API
export interface LawyerResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  profile_picture_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  bar_number: string;
  specialties: string[];
  experience_years: number;
  office_address?: string | null;
  office_city?: string | null;
  office_postal_code?: string | null;
  hourly_rate?: number | null;
  description?: string | null;
  languages: string[];
  availability_status: 'available' | 'busy' | 'unavailable';
  verified_by_admin: boolean;
  verified_at?: Date | null;
  rating: number;
  total_reviews: number;
  total_cases: number;
  active_cases: number;
  created_at: Date;
  updated_at: Date;
}

// Spécialité juridique
export interface LawyerSpecialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: Date;
}

// Input pour vérification d'avocat
export interface VerifyLawyerInput {
  lawyer_id: string;
  admin_id: string;
  notes?: string;
}

