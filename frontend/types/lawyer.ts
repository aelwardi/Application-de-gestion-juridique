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
  email: string;
  role: 'avocat';
  firstName: string;
  lastName: string;
  phone?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  isVerified: boolean;

  barNumber: string;
  specialties: string[];
  experienceYears: number;
  officeAddress?: string;
  officeCity?: string;
  officePostalCode?: string;
  latitude?: number;
  longitude?: number;
  hourlyRate?: number;
  description?: string;
  languages?: string[];
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  verifiedByAdmin: boolean;
  verifiedAt?: string;
  rating: number;
  totalReviews: number;
  totalCases: number;
  activeCases: number;

  createdAt: string;
  updatedAt: string;
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

export interface LawyerStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalClients: number;
  totalReviews: number;
  rating: number;
  upcomingAppointments: number;
}
