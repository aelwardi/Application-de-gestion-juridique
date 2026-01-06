export interface AppointmentSuggestion {
  id: string;
  appointment_id: string | null;
  suggested_by_user_id: string;
  suggested_to_user_id: string;
  suggested_start_time: string;
  suggested_end_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  notes?: string;
  created_at: string;
  updated_at: string;
  suggested_by_first_name?: string;
  suggested_by_last_name?: string;
  suggested_to_first_name?: string;
  suggested_to_last_name?: string;
  appointment_title?: string;
}

export interface CreateSuggestionDTO {
  appointment_id?: string;
  suggested_to_user_id: string;
  suggested_start_time: string;
  suggested_end_time: string;
  notes?: string;
}

export interface AvailableSlot {
  start: string;
  end: string;
  available: boolean;
}

