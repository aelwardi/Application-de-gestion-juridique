export interface Client {
  id: string;
  user_id: string;
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  total_cases: number;
  active_cases: number;
  created_at: Date;
  updated_at: Date;
}

export interface ClientWithUser extends Client {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture_url?: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface CreateClientInput {
  user_id: string;
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface UpdateClientInput {
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface ClientSearchFilters {
  name?: string;
  email?: string;
  city?: string;
  lawyer_id?: string;
  has_active_cases?: boolean;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export interface ClientStats {
  total_cases: number;
  active_cases: number;
  pending_cases: number;
  completed_cases: number;
  upcoming_appointments: number;
  total_documents: number;
  unread_messages: number;
}