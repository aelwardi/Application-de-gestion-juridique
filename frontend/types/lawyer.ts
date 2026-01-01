export interface LawyerRequest {
  id: string;
  client_id: string;
  lawyer_id: string;
  title: string;
  description: string;
  case_type: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  budget_min?: number;
  budget_max?: number;
  preferred_date?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
  lawyer_first_name?: string;
  lawyer_last_name?: string;
  lawyer_email?: string;
  lawyer_phone?: string;
  lawyer_profile_picture?: string;
  bar_number?: string;
  specialties?: string[];
  rating?: number;
  hourly_rate?: number;
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  client_phone?: string;
  client_profile_picture?: string;
  client_cases_count?: number;
}

export interface CreateLawyerRequestInput {
  lawyer_id: string;
  title: string;
  description: string;
  case_type: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  budget_min?: number;
  budget_max?: number;
  preferred_date?: string;
}

export interface LawyerRequestStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled?: number;
}

export interface Lawyer {
  id: string;
  user_id: string;
  bar_number: string;
  specialties: string[];
  experience_years: number;
  office_address?: string;
  office_city?: string;
  office_postal_code?: string;
  latitude?: number;
  longitude?: number;
  hourly_rate?: number;
  description?: string;
  languages?: string[];
  availability_status: 'available' | 'busy' | 'unavailable';
  verified_by_admin: boolean;
  verified_at?: string;
  rating: number;
  total_reviews: number;
  total_cases: number;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_picture_url?: string;
}

export interface LawyerSearchFilters {
  specialty?: string;
  city?: string;
  minRating?: number;
  maxRate?: number;
  availability?: 'available' | 'busy' | 'unavailable';
  verified?: boolean;
  limit?: number;
  offset?: number;
}