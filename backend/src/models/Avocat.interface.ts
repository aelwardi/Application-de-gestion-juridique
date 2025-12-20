export interface Avocat {
  id: string;
  user_id: string;
  bar_number: string;
  specialties: string[];
  office_address?: string;
  office_latitude?: number;
  office_longitude?: number;
  bio?: string;
  years_of_experience?: number;
  languages: string[];
  availability_status?: string;
  rating: number;
  total_cases: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAvocatInput {
  user: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    phone?: string;
    profile_picture_url?: string;
  };
  bar_number: string;
  specialties: string[];
  office_address?: string;
  office_latitude?: number;
  office_longitude?: number;
  bio?: string;
  years_of_experience?: number;
  languages: string[];
  availability_status?: string;
  rating?: number;
  total_cases?: number;
}