export type AppointmentType = 
   'consultation'
   'tribunal'
   'rencontre_client'
   'expertise'
   'mediation'
   'signature'
   'autre';

export type AppointmentLocationType = 
   'office'
   'court'
   'client_location'
   'online'
   'other';

export type AppointmentStatus = 
   'scheduled'
   'confirmed'
   'cancelled'
   'completed'
   'no_show';

export interface Appointment {
  id: string;
  case_id: string | null;
  lawyer_id: string;
  client_id: string;
  appointment_type: AppointmentType;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location_type: AppointmentLocationType;
  location_address: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  meeting_url: string | null;
  status: AppointmentStatus;
  reminder_sent: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  case_number?: string | null;
  case_title?: string | null;
  lawyer_first_name: string;
  lawyer_last_name: string;
  lawyer_email: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
}

export interface CreateAppointmentDTO {
  case_id?: string;
  lawyer_id: string;
  client_id: string;
  appointment_type: AppointmentType;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location_type: AppointmentLocationType;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  meeting_url?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentDTO {
  case_id?: string | null;
  appointment_type?: AppointmentType;
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location_type?: AppointmentLocationType;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  meeting_url?: string;
  status?: AppointmentStatus;
  reminder_sent?: boolean;
  notes?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  appointment_type?: AppointmentType;
  location_type?: AppointmentLocationType;
  lawyer_id?: string;
  client_id?: string;
  case_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  no_show: number;
  by_type: {
    [key in AppointmentType]?: number;
  };
  by_location: {
    [key in AppointmentLocationType]?: number;
  };
  upcoming: number;
  today: number;
  this_week: number;
  this_month: number;
}

export interface AppointmentResponse {
  success: boolean;
  message?: string;
  data?: Appointment | AppointmentWithDetails;
  error?: string;
}

export interface AppointmentsResponse {
  success: boolean;
  message?: string;
  data?: AppointmentWithDetails[];
  total?: number;
  error?: string;
}

export interface AppointmentStatsResponse {
  success: boolean;
  message?: string;
  data?: AppointmentStats;
  error?: string;
}

export const AppointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Planifié',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  no_show: 'Absent'
};

export const AppointmentStatusColors: Record<AppointmentStatus, string> = {
  scheduled: '#FCD34D',
  confirmed: '#60A5FA',
  cancelled: '#F87171',
  completed: '#34D399',
  no_show: '#F59E0B'
};

export const AppointmentTypeLabels: Record<AppointmentType, string> = {
  consultation: 'Consultation',
  tribunal: 'Tribunal',
  rencontre_client: 'Rencontre client',
  expertise: 'Expertise',
  mediation: 'Médiation',
  signature: 'Signature',
  autre: 'Autre'
};

export const AppointmentLocationTypeLabels: Record<AppointmentLocationType, string> = {
  office: 'Cabinet',
  court: 'Tribunal',
  client_location: 'Chez le client',
  online: 'En ligne',
  other: 'Autre'
};
