import * as emailService from '../../../src/services/email.service';
import * as emailUtil from '../../../src/utils/email.util';

jest.mock('../../../src/utils/email.util');

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendCustomEmail', () => {
    it('should send custom email successfully', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
        text: 'Test text content',
      };

      (emailUtil.sendEmail as jest.Mock).mockResolvedValue(true);

      const result = await emailService.sendCustomEmail(emailData);

      expect(emailUtil.sendEmail).toHaveBeenCalledWith(emailData);
      expect(result).toBe(true);
    });

    it('should send custom email without text content', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
      };

      (emailUtil.sendEmail as jest.Mock).mockResolvedValue(true);

      const result = await emailService.sendCustomEmail(emailData);

      expect(emailUtil.sendEmail).toHaveBeenCalledWith(emailData);
      expect(result).toBe(true);
    });

    it('should handle email sending failure', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
      };

      (emailUtil.sendEmail as jest.Mock).mockResolvedValue(false);

      const result = await emailService.sendCustomEmail(emailData);

      expect(emailUtil.sendEmail).toHaveBeenCalledWith(emailData);
      expect(result).toBe(false);
    });

    it('should propagate errors from email utility', async () => {
      const emailData = {
        to: 'invalid-email',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
      };

      (emailUtil.sendEmail as jest.Mock).mockRejectedValue(new Error('Invalid email address'));

      await expect(emailService.sendCustomEmail(emailData)).rejects.toThrow(
        'Invalid email address'
      );
    });
  });

  describe('sendAppointmentEmail', () => {
    it('should send appointment notification successfully', async () => {
      const appointmentData = {
        email: 'client@example.com',
        firstName: 'John',
        appointmentDate: new Date('2024-12-25T10:00:00Z'),
        lawyerName: 'Jane Smith',
        appointmentType: 'Consultation',
      };

      (emailUtil.sendAppointmentNotification as jest.Mock).mockResolvedValue(true);

      const result = await emailService.sendAppointmentEmail(appointmentData);

      expect(emailUtil.sendAppointmentNotification).toHaveBeenCalledWith(
        appointmentData.email,
        appointmentData.firstName,
        appointmentData.appointmentDate,
        appointmentData.lawyerName,
        appointmentData.appointmentType
      );
      expect(result).toBe(true);
    });

    it('should handle appointment email sending failure', async () => {
      const appointmentData = {
        email: 'client@example.com',
        firstName: 'John',
        appointmentDate: new Date('2024-12-25T10:00:00Z'),
        lawyerName: 'Jane Smith',
        appointmentType: 'Consultation',
      };

      (emailUtil.sendAppointmentNotification as jest.Mock).mockResolvedValue(false);

      const result = await emailService.sendAppointmentEmail(appointmentData);

      expect(emailUtil.sendAppointmentNotification).toHaveBeenCalledWith(
        appointmentData.email,
        appointmentData.firstName,
        appointmentData.appointmentDate,
        appointmentData.lawyerName,
        appointmentData.appointmentType
      );
      expect(result).toBe(false);
    });

    it('should propagate errors from appointment notification utility', async () => {
      const appointmentData = {
        email: 'client@example.com',
        firstName: 'John',
        appointmentDate: new Date('2024-12-25T10:00:00Z'),
        lawyerName: 'Jane Smith',
        appointmentType: 'Consultation',
      };

      (emailUtil.sendAppointmentNotification as jest.Mock).mockRejectedValue(
        new Error('Email service unavailable')
      );

      await expect(emailService.sendAppointmentEmail(appointmentData)).rejects.toThrow(
        'Email service unavailable'
      );
    });

    it('should handle different appointment types', async () => {
      const appointmentTypes = ['Consultation', 'Court Hearing', 'Follow-up', 'Initial Meeting'];

      (emailUtil.sendAppointmentNotification as jest.Mock).mockResolvedValue(true);

      for (const type of appointmentTypes) {
        const appointmentData = {
          email: 'client@example.com',
          firstName: 'John',
          appointmentDate: new Date(),
          lawyerName: 'Jane Smith',
          appointmentType: type,
        };

        const result = await emailService.sendAppointmentEmail(appointmentData);

        expect(result).toBe(true);
        expect(emailUtil.sendAppointmentNotification).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.any(Date),
          expect.any(String),
          type
        );
      }
    });

    it('should handle appointment with future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const appointmentData = {
        email: 'client@example.com',
        firstName: 'John',
        appointmentDate: futureDate,
        lawyerName: 'Jane Smith',
        appointmentType: 'Consultation',
      };

      (emailUtil.sendAppointmentNotification as jest.Mock).mockResolvedValue(true);

      const result = await emailService.sendAppointmentEmail(appointmentData);

      expect(emailUtil.sendAppointmentNotification).toHaveBeenCalledWith(
        appointmentData.email,
        appointmentData.firstName,
        futureDate,
        appointmentData.lawyerName,
        appointmentData.appointmentType
      );
      expect(result).toBe(true);
    });
  });
});