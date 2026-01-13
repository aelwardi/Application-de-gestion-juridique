export const createMockUser = (overrides = {}): any => ({
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'client' as const,
  phone: null,
  profilePictureUrl: null,
  isActive: true,
  isVerified: true,
  emailVerified: false,
  twoFactorEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});


export const createMockCase = (overrides = {}) => ({
  id: 'case-123',
  title: 'Test Case',
  description: 'Test description',
  case_type: 'civil',
  status: 'pending',
  client_id: 'client-123',
  created_at: new Date().toISOString(),
  ...overrides,
});


export const createMockAppointment = (overrides = {}) => ({
  id: 'appt-123',
  title: 'Test Appointment',
  description: 'Test description',
  appointment_type: 'consultation',
  start_time: new Date(Date.now() + 86400000).toISOString(),
  end_time: new Date(Date.now() + 90000000).toISOString(),
  location_type: 'office',
  status: 'scheduled',
  lawyer_id: 'lawyer-123',
  client_id: 'client-123',
  created_at: new Date().toISOString(),
  ...overrides,
});


export const createMockDocument = (overrides = {}) => ({
  id: 'doc-123',
  title: 'Test Document',
  description: 'Test description',
  file_name: 'test.pdf',
  file_path: '/uploads/documents/test.pdf',
  file_size: 1024,
  mime_type: 'application/pdf',
  uploader_id: 'user-123',
  case_id: 'case-123',
  created_at: new Date().toISOString(),
  ...overrides,
});



