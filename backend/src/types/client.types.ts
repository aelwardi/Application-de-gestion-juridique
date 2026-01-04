// =====================================================
// Types pour les CLIENTS (simplifié - référence users.types.ts)
// Note: Client est maintenant un type dans users.types.ts
// =====================================================

import { Client, ClientSearchFilters as BaseClientSearchFilters, CreateClientInput as BaseCreateClientInput, UpdateClientInput as BaseUpdateClientInput } from './users.types';

// Ré-export pour compatibilité
export type { Client };

// Ré-export des types d'input
export type CreateClientInput = BaseCreateClientInput;
export type UpdateClientInput = BaseUpdateClientInput;

// Client avec informations complètes
export interface ClientWithStats extends Client {
  pending_cases?: number;
  completed_cases?: number;
  upcoming_appointments?: number;
  total_documents?: number;
  unread_messages?: number;
}

// Ré-export et extension des filtres
export interface ClientSearchFilters extends BaseClientSearchFilters {
  lawyer_id?: string; // Pour rechercher clients d'un avocat spécifique
}

// Statistiques détaillées du client
export interface ClientStats {
  total_cases: number;
  active_cases: number;
  pending_cases: number;
  completed_cases: number;
  upcoming_appointments: number;
  total_documents: number;
  unread_messages?: number;
  total_spent?: number;
  lawyers_worked_with?: number;
}

// Response pour API
export interface ClientResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  profile_picture_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  total_cases: number;
  active_cases: number;
  created_at: Date;
  updated_at: Date;
}