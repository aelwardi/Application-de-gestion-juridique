export const mockAppointment = {
  id: '456e4567-e89b-12d3-a456-426614174000',
  clientId: '123e4567-e89b-12d3-a456-426614174000',
  lawyerId: '223e4567-e89b-12d3-a456-426614174000',
  dossierId: '789e4567-e89b-12d3-a456-426614174000',
  appointmentDate: new Date('2024-06-15T10:00:00Z'),
  durationMinutes: 60,
  location: 'Cabinet juridique, 123 Rue de la Loi',
  status: 'scheduled' as const,
  notes: 'Première consultation',
  reminderSent: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockAppointmentsList = [
  mockAppointment,
  {
    ...mockAppointment,
    id: '556e4567-e89b-12d3-a456-426614174000',
    appointmentDate: new Date('2024-06-20T14:00:00Z'),
    status: 'confirmed' as const,
    notes: 'Suivi du dossier',
  },
  {
    ...mockAppointment,
    id: '656e4567-e89b-12d3-a456-426614174000',
    appointmentDate: new Date('2024-05-10T09:00:00Z'),
    status: 'completed' as const,
    notes: 'Consultation initiale',
  },
];

export const mockCreateAppointmentData = {
  clientId: '123e4567-e89b-12d3-a456-426614174000',
  lawyerId: '223e4567-e89b-12d3-a456-426614174000',
  dossierId: '789e4567-e89b-12d3-a456-426614174000',
  appointmentDate: new Date('2024-06-15T10:00:00Z'),
  durationMinutes: 60,
  location: 'Cabinet juridique',
  notes: 'Consultation initiale',
};