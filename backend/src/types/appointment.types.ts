export type AppointmentType = 
  | 'consultation'
  | 'tribunal'
  | 'rencontre_client'
  | 'expertise'
  | 'mediation'
  | 'signature'
  | 'court'
  | 'meeting'
  | 'phone'
  | 'video'
  | 'autre';

export type AppointmentLocationType = 
  | 'office'
  | 'court'
  | 'client_location'
  | 'online'
  | 'other';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface Appointment {
  id: string;
  case_id: string | null;
  lawyer_id: string;
  client_id: string;
  appointment_type: AppointmentType;
  title: string;
  description: string | null;
  start_time: Date;
  end_time: Date;
  location: string | null;
  location_type: AppointmentLocationType | null;
  location_address: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  meeting_url: string | null;
  status: AppointmentStatus;
  reminder_sent: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
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
  start_time: Date | string;
  end_time: Date | string;
  location?: string;
  location_type?: AppointmentLocationType;
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
  start_time?: Date | string;
  end_time?: Date | string;
  location?: string;
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
  lawyer_id?: string;
  client_id?: string;
  case_id?: string;
  start_date?: Date | string;
  end_date?: Date | string;
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
  upcoming: number;
  today: number;
  this_week: number;
  this_month: number;
}