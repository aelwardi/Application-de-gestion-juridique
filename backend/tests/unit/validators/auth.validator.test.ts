import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  lawyerDataSchema,
  clientDataSchema,
} from '../../../src/validators/auth.validator';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'client' as const,
      phone: '+1234567890',
    };

    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = { ...validRegisterData, email: 'invalid-email' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject short password', () => {
      const data = { ...validRegisterData, password: 'Short1!' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject password without uppercase', () => {
      const data = { ...validRegisterData, password: 'password123!' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('should reject password without lowercase', () => {
      const data = { ...validRegisterData, password: 'PASSWORD123!' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should reject password without number', () => {
      const data = { ...validRegisterData, password: 'Password!' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number');
      }
    });

    it('should reject password without special character', () => {
      const data = { ...validRegisterData, password: 'Password123' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('special character');
      }
    });

    it('should reject short first name', () => {
      const data = { ...validRegisterData, firstName: 'J' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short last name', () => {
      const data = { ...validRegisterData, lastName: 'D' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept optional phone', () => {
      const data = { ...validRegisterData };
      delete (data as any).phone;
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const data = {
        email: 'test@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate correct refresh token', () => {
      const data = { refreshToken: 'valid-refresh-token' };
      const result = refreshTokenSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty refresh token', () => {
      const data = { refreshToken: '' };
      const result = refreshTokenSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const data = { email: 'test@example.com' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = { email: 'invalid-email' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate correct reset data', () => {
      const data = {
        token: 'valid-reset-token',
        password: 'NewPassword123!',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const data = {
        token: '',
        password: 'NewPassword123!',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const data = {
        token: 'valid-reset-token',
        password: 'weak',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate correct change password data', () => {
      const data = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };
      const result = changePasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty current password', () => {
      const data = {
        currentPassword: '',
        newPassword: 'NewPassword123!',
      };
      const result = changePasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject weak new password', () => {
      const data = {
        currentPassword: 'OldPassword123!',
        newPassword: 'weak',
      };
      const result = changePasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate correct profile update', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
      };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial updates', () => {
      const data = { firstName: 'John' };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const data = {};
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('lawyerDataSchema', () => {
    it('should validate correct lawyer data', () => {
      const data = {
        barNumber: 'BAR123456',
        specialties: ['Droit civil', 'Droit pénal'],
        officeAddress: '123 Test Street',
        yearsOfExperience: 5,
        bio: 'Experienced lawyer',
      };
      const result = lawyerDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty bar number', () => {
      const data = {
        barNumber: '',
      };
      const result = lawyerDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative years of experience', () => {
      const data = {
        barNumber: 'BAR123456',
        yearsOfExperience: -1,
      };
      const result = lawyerDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject too many years of experience', () => {
      const data = {
        barNumber: 'BAR123456',
        yearsOfExperience: 101,
      };
      const result = lawyerDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('clientDataSchema', () => {
    it('should validate correct client data', () => {
      const data = {
        address: '123 Main St',
        city: 'Paris',
        postalCode: '75001',
      };
      const result = clientDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial data', () => {
      const data = {
        city: 'Paris',
      };
      const result = clientDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const data = {};
      const result = clientDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});