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
  opening_date: string;
  closing_date?: string;
  court_name?: string;
  judge_name?: string;
  next_hearing_date?: string;
  estimated_duration_months?: number;
  created_at: string;
  updated_at: string;
}

export interface CaseWithDetails extends Case {
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  client_phone?: string;
  lawyer_first_name?: string;
  lawyer_last_name?: string;
  lawyer_email?: string;
  lawyer_phone?: string;
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
  next_hearing_date?: string;
  estimated_duration_months?: number;
}

export interface UpdateCaseDTO {
  title?: string;
  description?: string;
  case_type?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  lawyer_id?: string;
  closing_date?: string;
  court_name?: string;
  judge_name?: string;
  next_hearing_date?: string;
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

export interface CaseResponse {
  success: boolean;
  data?: Case | CaseWithDetails;
  message?: string;
}

export interface CasesResponse {
  success: boolean;
  data?: CaseWithDetails[];
  total?: number;
  message?: string;
}

export interface CaseStatsResponse {
  success: boolean;
  data?: CaseStats;
  message?: string;
}

// Labels pour l'affichage
export const CaseStatusLabels: Record<CaseStatus, string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  in_progress: 'En cours',
  on_hold: 'En suspens',
  resolved: 'Résolu',
  closed: 'Fermé',
  rejected: 'Rejeté',
  archived: 'Archivé'
};

export const CasePriorityLabels: Record<CasePriority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente'
};

export const CaseTypeLabels: Record<string, string> = {
  familial: 'Droit de la famille',
  civil: 'Droit civil',
  pénal: 'Droit pénal',
  commercial: 'Droit commercial',
  administratif: 'Droit administratif',
  travail: 'Droit du travail',
  immobilier: 'Droit immobilier'
};

// Classes CSS pour les badges de statut
export const CaseStatusColors: Record<CaseStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  on_hold: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-600'
};

// Classes CSS pour les badges de priorité
export const CasePriorityColors: Record<CasePriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};
