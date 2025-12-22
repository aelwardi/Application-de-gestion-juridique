export interface ClientRequest {
  id: string;
  client_id: string;
  lawyer_id?: string;
  request_type: 'consultation' | 'new_case' | 'second_opinion' | 'urgent';
  title: string;
  description: string;
  case_category?: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  budget_min?: number;
  budget_max?: number;
  preferred_date?: Date;
  status: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  lawyer_response?: string;
  responded_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClientRequestInput {
  client_id: string;
  lawyer_id?: string;
  request_type: 'consultation' | 'new_case' | 'second_opinion' | 'urgent';
  title: string;
  description: string;
  case_category?: string;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  budget_min?: number;
  budget_max?: number;
  preferred_date?: Date;
}

export interface UpdateClientRequestInput {
  lawyer_id?: string;
  status?: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  lawyer_response?: string;
  responded_at?: Date;
}

export interface ClientNote {
  id: string;
  client_id: string;
  created_by: string;
  note_type: 'general' | 'important' | 'warning' | 'reminder' | 'meeting';
  title?: string;
  content: string;
  is_private: boolean;
  remind_at?: Date;
  reminder_sent: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClientNoteInput {
  client_id: string;
  created_by: string;
  note_type?: 'general' | 'important' | 'warning' | 'reminder' | 'meeting';
  title?: string;
  content: string;
  is_private?: boolean;
  remind_at?: Date;
}

export interface UpdateClientNoteInput {
  note_type?: 'general' | 'important' | 'warning' | 'reminder' | 'meeting';
  title?: string;
  content?: string;
  is_private?: boolean;
  remind_at?: Date;
  reminder_sent?: boolean;
}

export interface ClientPayment {
  id: string;
  client_id: string;
  case_id?: string;
  amount: number;
  payment_type: 'consultation' | 'retainer' | 'hourly' | 'fixed' | 'expense' | 'other';
  payment_method?: 'cash' | 'check' | 'card' | 'transfer' | 'online';
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';
  due_date?: Date;
  paid_date?: Date;
  invoice_number?: string;
  description?: string;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClientPaymentInput {
  client_id: string;
  case_id?: string;
  amount: number;
  payment_type: 'consultation' | 'retainer' | 'hourly' | 'fixed' | 'expense' | 'other';
  payment_method?: 'cash' | 'check' | 'card' | 'transfer' | 'online';
  status?: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';
  due_date?: Date;
  paid_date?: Date;
  invoice_number?: string;
  description?: string;
  notes?: string;
  created_by?: string;
}

export interface UpdateClientPaymentInput {
  amount?: number;
  payment_method?: 'cash' | 'check' | 'card' | 'transfer' | 'online';
  status?: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';
  due_date?: Date;
  paid_date?: Date;
  invoice_number?: string;
  description?: string;
  notes?: string;
}

export interface ClientCommunication {
  id: string;
  client_id: string;
  case_id?: string;
  communication_type: 'email' | 'phone' | 'meeting' | 'sms' | 'video_call' | 'other';
  direction: 'incoming' | 'outgoing';
  subject?: string;
  summary?: string;
  duration_minutes?: number;
  outcome?: string;
  follow_up_required: boolean;
  follow_up_date?: Date;
  created_by: string;
  created_at: Date;
}

export interface CreateClientCommunicationInput {
  client_id: string;
  case_id?: string;
  communication_type: 'email' | 'phone' | 'meeting' | 'sms' | 'video_call' | 'other';
  direction: 'incoming' | 'outgoing';
  subject?: string;
  summary?: string;
  duration_minutes?: number;
  outcome?: string;
  follow_up_required?: boolean;
  follow_up_date?: Date;
  created_by: string;
}

export interface ClientFinancialSummary {
  total_billed: number;
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  payment_history: ClientPayment[];
}

export interface ClientActivitySummary {
  total_communications: number;
  last_contact_date?: Date;
  pending_follow_ups: number;
  upcoming_reminders: number;
  communication_breakdown: {
    email: number;
    phone: number;
    meeting: number;
    sms: number;
    video_call: number;
    other: number;
  };
}