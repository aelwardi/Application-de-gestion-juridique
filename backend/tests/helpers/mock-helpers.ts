import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

/**
 * Mock helpers for backend tests - fully isolated from database and external services
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
  role: 'avocat',
  specializations: ['Droit civil', 'Droit pénal'],
  years_of_experience: 5,
  bar_number: 'BAR123456',
  office_address: '123 Test Street, Paris',
  bio: 'Avocat expérimenté en droit civil et pénal',
  hourly_rate: 150.00,
  availability_radius_km: 50,
  ...overrides,
});

export const mockAdmin = (overrides: any = {}) => mockUser({
  role: 'admin',
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
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
  file_size: 1024 * 1024,
  document_type: 'contract',
  description: 'Test document',
  created_at: new Date(),
  ...overrides,
});

/**
 * Create a mock PostgreSQL query result
 */
export const mockQueryResult = (rows: any[] = [], rowCount?: number) => ({
  rows,
  rowCount: rowCount ?? rows.length,
  command: 'SELECT',
  oid: 0,
  fields: [],
});

/**
 * Mock for the PostgreSQL pool
 */
export const createMockPool = () => {
  const mockQuery = jest.fn();
  const mockConnect = jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn(),
  });
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
 * Create a mock Express Request object
 */
export const mockRequest = (overrides: any = {}): any => {
  const req: any = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: undefined,
    ip: '127.0.0.1',
    method: 'GET',
    path: '/',
    get: jest.fn((header: string) => {
      const headers = req.headers as Record<string, string>;
      return headers[header.toLowerCase()] || undefined;
    }),
    ...overrides,
  };
  return req;
};

/**
 * Create a mock Express Response object
 */
export const mockResponse = (): any => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Create a mock Express NextFunction
 */
export const mockNext = (): NextFunction => jest.fn();

/**
 * Create a successful API response
 */
export const mockSuccessResponse = <T>(data: T, message = 'Success') => ({
  success: true,
  message,
  data,
});

/**
 * Create an error API response
 */
export const mockErrorResponse = (message: string, errors?: any[]) => ({
  success: false,
  message,
  errors,
});

/**
 * Generate multiple mock users
 */
export const generateMockUsers = (count: number, overrides: any = {}) => {
  return Array.from({ length: count }, (_, i) =>
    mockUser({ email: `user${i}@test.com`, ...overrides })
  );
};

/**
 * Generate multiple mock appointments
 */
export const generateMockAppointments = (count: number, overrides: any = {}) => {
  return Array.from({ length: count }, () => mockAppointment(overrides));
};

/**
 * Generate multiple mock cases
 */
export const generateMockCases = (count: number, overrides: any = {}) => {
  return Array.from({ length: count }, () => mockCase(overrides));
};

/**
 * Create a date in the future
 */
export const futureDate = (daysAhead: number = 1) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
};

/**
 * Create a date in the past
 */
export const pastDate = (daysAgo: number = 1) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

/**
 * Check if a value is a valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Check if a value is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};