import * as emailUtil from '../../../src/utils/email.util';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('Email Utility', () => {
  let mockSendMail: jest.Mock;
  let mockCreateTransport: jest.Mock;

  beforeEach(() => {
    mockSendMail = jest.fn();
    mockCreateTransport = jest.fn(() => ({
      sendMail: mockSendMail,
    }));

    (nodemailer.createTransport as jest.Mock) = mockCreateTransport;

    process.env.GMAIL_APP_USERNAME = 'test@example.com';
    process.env.GMAIL_APP_PASSWORD = 'test-password';
    process.env.FRONTEND_URL = 'http://localhost:3001';

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.GMAIL_APP_USERNAME;
    delete process.env.GMAIL_APP_PASSWORD;
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      const result = await emailUtil.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test Email</h1>',
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"Gestion Juridique" <test@example.com>',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test Email</h1>',
        text: 'Test Email',
      });
      expect(result).toBe(true);
    });

    it('should include custom text if provided', async () => {
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await emailUtil.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<h1>Test</h1>',
        text: 'Custom plain text',
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Custom plain text',
        })
      );
    });

    it('should return false if email credentials are missing', async () => {
      delete process.env.GMAIL_APP_USERNAME;
      delete process.env.GMAIL_APP_PASSWORD;

      const result = await emailUtil.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<h1>Test</h1>',
      });

      expect(result).toBe(false);
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should return false on email send error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await emailUtil.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<h1>Test</h1>',
      });

      expect(result).toBe(false);
    });

    it('should handle email errors with error codes', async () => {
      const error = new Error('SMTP error');
      (error as any).code = 'ECONNREFUSED';
      mockSendMail.mockRejectedValue(error);

      const result = await emailUtil.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<h1>Test</h1>',
      });

      expect(result).toBe(false);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct content', async () => {
      mockSendMail.mockResolvedValue({
        messageId: 'welcome-message-id',
      });

      const result = await emailUtil.sendWelcomeEmail('user@example.com', 'John', 'Doe');

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toBe('Bienvenue sur Gestion Juridique');
      expect(callArgs.html).toContain('John Doe');
      expect(callArgs.html).toContain('http://localhost:3000/auth/login');
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockSendMail.mockRejectedValue(new Error('Send failed'));

      const result = await emailUtil.sendWelcomeEmail('user@example.com', 'John', 'Doe');

      expect(result).toBe(false);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with reset link', async () => {
      mockSendMail.mockResolvedValue({
        messageId: 'reset-message-id',
      });

      const result = await emailUtil.sendPasswordResetEmail(
        'user@example.com',
        'John',
        'reset-token-123'
      );

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('Réinitialisation');
      expect(callArgs.html).toContain('John');
      expect(callArgs.html).toContain('reset-token-123');
      expect(callArgs.html).toContain('http://localhost:3000/auth/reset-password');
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockSendMail.mockRejectedValue(new Error('Send failed'));

      const result = await emailUtil.sendPasswordResetEmail('user@example.com', 'John', 'token');

      expect(result).toBe(false);
    });
  });

  describe('sendAppointmentNotification', () => {
    it('should send appointment notification email', async () => {
      mockSendMail.mockResolvedValue({
        messageId: 'appointment-message-id',
      });

      const appointmentDate = new Date('2024-01-15T14:00:00');

      const result = await emailUtil.sendAppointmentNotification(
        'client@example.com',
        'Jean',
        appointmentDate,
        'Avocat Martin',
        'Consultation juridique'
      );

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('client@example.com');
      expect(callArgs.subject).toContain('rendez-vous');
      expect(callArgs.html).toContain('Jean');
      expect(callArgs.html).toContain('Avocat Martin');
      expect(result).toBe(true);
    });
  });

  describe('sendDocumentUploadedEmail', () => {
    it('should send document uploaded notification', async () => {
      mockSendMail.mockResolvedValue({
        messageId: 'doc-upload-message-id',
      });

      const result = await emailUtil.sendDocumentUploadedEmail(
        'user@example.com',
        'Marie',
        'Avocat Dupont',
        'contrat.pdf',
        'Dossier Immobilier',
        'case-123',
        false
      );

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('Nouveau document');
      expect(callArgs.html).toContain('Marie');
      expect(callArgs.html).toContain('contrat.pdf');
      expect(result).toBe(true);
    });
  });

  describe('sendTwoFactorEnabledEmail', () => {
    it('should send 2FA enabled notification', async () => {
      mockSendMail.mockResolvedValue({
        messageId: '2fa-enabled-id',
      });

      const result = await emailUtil.sendTwoFactorEnabledEmail('user@example.com', 'Sophie');

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('Authentification');
      expect(callArgs.html).toContain('Sophie');
      expect(callArgs.html).toContain('activée');
      expect(result).toBe(true);
    });
  });

  describe('sendTwoFactorDisabledEmail', () => {
    it('should send 2FA disabled notification', async () => {
      mockSendMail.mockResolvedValue({
        messageId: '2fa-disabled-id',
      });

      const result = await emailUtil.sendTwoFactorDisabledEmail('user@example.com', 'Sophie');

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('Authentification');
      expect(callArgs.html).toContain('Sophie');
      expect(callArgs.html).toContain('désactivée');
      expect(result).toBe(true);
    });
  });
});