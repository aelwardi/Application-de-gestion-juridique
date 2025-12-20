export interface Client {
  id: string;
  user_id: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: Date;
  occupation?: string;
  company_name?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClientInput {
  user: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    phone?: string;
    profile_picture_url?: string;
  };
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: Date;
  occupation?: string;
  company_name?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
}