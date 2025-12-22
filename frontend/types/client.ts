export interface Client {
  id: string;
  userId: string;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  totalCases: number;
  activeCases: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientWithUser extends Client {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface CreateClientInput {
  userId: string;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface UpdateClientInput {
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface ClientSearchFilters {
  name?: string;
  email?: string;
  city?: string;
  lawyerId?: string;
  hasActiveCases?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface ClientStats {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  completedCases: number;
  upcomingAppointments: number;
  totalDocuments: number;
  unreadMessages: number;
}

export interface ClientCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  category?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lawyerFirstName?: string;
  lawyerLastName?: string;
  lawyerEmail?: string;
  nextHearingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientAppointment {
  id: string;
  caseId?: string;
  lawyerId: string;
  appointmentType: 'consultation' | 'court' | 'meeting' | 'phone' | 'video';
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  lawyerFirstName?: string;
  lawyerLastName?: string;
  caseTitle?: string;
  caseNumber?: string;
  notes?: string;
  createdAt: Date;
}

export interface ClientDocument {
  id: string;
  caseId: string;
  uploadedBy: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
  isConfidential: boolean;
  caseTitle?: string;
  caseNumber?: string;
  uploadedByFirstName?: string;
  uploadedByLastName?: string;
  createdAt: Date;
}