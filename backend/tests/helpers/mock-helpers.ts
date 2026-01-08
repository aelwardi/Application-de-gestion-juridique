import { v4 as uuidv4 } from 'uuid';

/**
 * Mock helpers pour les tests sans base de données
 */

export const mockUser = (overrides: any = {}) => ({
  id: uuidv4(),
  email: 'test@example.com',
  password_hash: '$2b$10$hashedpassword',
  role: 'client',
  first_name: 'Test',
  last_name: 'User',
  phone: '+1234567890',
  is_active: true,
  email_verified: false,
  profile_picture_url: null,
  specializations: null,
  years_of_experience: null,
  bar_number: null,
  office_address: null,
  bio: null,
  hourly_rate: null,
  availability_radius_km: null,
  created_at: new Date(),
  updated_at: new Date(),
  last_login: null,
  ...overrides,
});

export const mockLawyer = (overrides: any = {}) => mockUser({
  role: 'lawyer',
  specializations: ['Droit civil'],
  years_of_experience: 5,
  bar_number: 'BAR123456',
  office_address: '123 Test Street',
  bio: 'Experienced lawyer',
  hourly_rate: 150.00,
  availability_radius_km: 50,
  ...overrides,
});

export const mockAppointment = (overrides: any = {}) => ({
  id: uuidv4(),
  client_id: uuidv4(),
  lawyer_id: uuidv4(),
  case_id: null,
  start_time: new Date(Date.now() + 86400000), // Tomorrow
  end_time: new Date(Date.now() + 86400000 + 3600000), // Tomorrow + 1 hour
  appointment_type: 'consultation',
  status: 'scheduled',
  location: 'Office',
  notes: 'Test appointment',
  reminder_sent: false,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const mockCase = (overrides: any = {}) => ({
  id: uuidv4(),
  client_id: uuidv4(),
  lawyer_id: uuidv4(),
  title: 'Test Case',
  description: 'Test case description',
  case_type: 'civil',
  status: 'open',
  priority: 'medium',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const mockNotification = (overrides: any = {}) => ({
  id: uuidv4(),
  user_id: uuidv4(),
  notification_type: 'info',
  title: 'Test Notification',
  message: 'Test message',
  is_read: false,
  data: null,
  created_at: new Date(),
  ...overrides,
});

export const mockDocument = (overrides: any = {}) => ({
  id: uuidv4(),
  case_id: uuidv4(),
  uploaded_by: uuidv4(),
  file_name: 'test-document.pdf',
  file_path: '/uploads/documents/test.pdf',
  file_type: 'application/pdf',
  file_size: 1024,
  document_type: 'contract',
  description: 'Test document',
  created_at: new Date(),
  ...overrides,
});

/**
 * Créer un mock de résultat de query PostgreSQL
 */
export const mockQueryResult = (rows: any[] = [], rowCount?: number) => ({
  rows,
  rowCount: rowCount ?? rows.length,
  command: 'SELECT',
  oid: 0,
  fields: [],
});

/**
 * Mock pour le pool de base de données
 */
export const createMockPool = () => {
  const mockQuery = jest.fn();
  const mockConnect = jest.fn();
  const mockEnd = jest.fn();

  return {
    query: mockQuery,
    connect: mockConnect,
    end: mockEnd,
    _reset: () => {
      mockQuery.mockReset();
      mockConnect.mockReset();
      mockEnd.mockReset();
    },
  };
};

/**
 * Mock pour Request Express
 */
export const mockRequest = (overrides: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: undefined,
  get: jest.fn((header: string) => overrides.headers?.[header] || null),
  ...overrides,
});

/**
 * Mock pour Response Express
 */
export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Mock pour Next Express
 */
export const mockNext = () => jest.fn();

