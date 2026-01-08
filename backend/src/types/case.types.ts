export type CaseStatus = 'pending' | 'accepted' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'rejected' | 'archived';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description?: string;
  case_type: string;
  status: CaseStatus;
  priority: CasePriority;
  client_id: string;
  lawyer_id?: string;
  opening_date: Date;
  closing_date?: Date;
  court_name?: string;
  judge_name?: string;
  next_hearing_date?: Date;
  estimated_duration_months?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CaseWithDetails extends Case {
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  lawyer_first_name?: string;
  lawyer_last_name?: string;
  lawyer_email?: string;
}

export interface CreateCaseDTO {
  title: string;
  description?: string;
  case_type: string;
  priority?: CasePriority;
  client_id: string;
  lawyer_id?: string;
  court_name?: string;
  judge_name?: string;
  next_hearing_date?: Date;
  estimated_duration_months?: number;
}

export interface UpdateCaseDTO {
  title?: string;
  description?: string;
  case_type?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  lawyer_id?: string;
  closing_date?: Date;
  court_name?: string;
  judge_name?: string;
  next_hearing_date?: Date;
  estimated_duration_months?: number;
}

export interface CaseFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  case_type?: string;
  lawyer_id?: string;
  client_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CaseStats {
  total: number;
  pending: number;
  accepted: number;
  in_progress: number;
  on_hold: number;
  resolved: number;
  closed: number;
  rejected: number;
  archived: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  by_type: Record<string, number>;
}