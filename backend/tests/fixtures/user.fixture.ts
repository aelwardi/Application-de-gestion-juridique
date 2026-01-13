export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  password_hash: '$2b$10$mockedHashedPassword',
  role: 'client' as const,
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  profile_picture_url: null,
  is_active: true,
  is_verified: false,
  last_login_at: null,
  two_factor_enabled: false,
  two_factor_secret: null,
  two_factor_backup_codes: null,
  two_factor_verified_at: null,
  address: null,
  city: null,
  postal_code: null,
  emergency_contact_name: null,
  emergency_contact_phone: null,
  notes: null,
  total_cases: 0,
  active_cases: 0,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
};

export const mockLawyer = {
  ...mockUser,
  id: '223e4567-e89b-12d3-a456-426614174000',
  email: 'lawyer@example.com',
  role: 'avocat' as const,
  first_name: 'Jane',
  last_name: 'Smith',
  bar_number: 'BAR123456',
  specialties: ['Droit pénal', 'Droit civil'],
  experience_years: 5,
  office_address: '123 Law Street',
  office_city: 'Paris',
  office_postal_code: '75001',
  latitude: 48.8566,
  longitude: 2.3522,
  hourly_rate: 150.00,
  description: 'Experienced lawyer',
  languages: ['French', 'English'],
  availability_status: 'available',
  verified_by_admin: true,
  verified_at: new Date('2024-01-01T00:00:00Z'),
  rating: 4.5,
  total_reviews: 10,
};

export const mockAdmin = {
  ...mockUser,
  id: '323e4567-e89b-12d3-a456-426614174000',
  email: 'admin@example.com',
  role: 'admin' as const,
  first_name: 'Admin',
  last_name: 'User',
};

export const mockUserResponse = {
  id: mockUser.id,
  email: mockUser.email,
  role: mockUser.role,
  firstName: mockUser.first_name,
  lastName: mockUser.last_name,
  phone: mockUser.phone,
  profilePictureUrl: mockUser.profile_picture_url,
  isActive: mockUser.is_active,
  isVerified: mockUser.is_verified,
  twoFactorEnabled: mockUser.two_factor_enabled,
  lastLoginAt: mockUser.last_login_at,
  createdAt: mockUser.created_at,
  updatedAt: mockUser.updated_at,
};

export const mockRegisterInput = {
  email: 'newuser@example.com',
  password: 'SecurePassword123!',
  role: 'client' as const,
  firstName: 'New',
  lastName: 'User',
  phone: '+1234567890',
};

export const mockLoginInput = {
  email: 'test@example.com',
  password: 'SecurePassword123!',
};

export const mockUpdateProfileInput = {
  firstName: 'Updated',
  lastName: 'Name',
  phone: '+0987654321',
};

export const mockChangePasswordInput = {
  currentPassword: 'OldPassword123!',
  newPassword: 'NewPassword123!',
};
