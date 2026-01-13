import { pool } from '../../../src/config/database.config';

jest.mock('../../../src/config/database.config');

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
const mockTransporter = {
  sendMail: mockSendMail,
};

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter),
}));

import { sendAppointmentReminder } from '../../../src/services/reminder.service';

describe('ReminderService', () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'test-password';
    process.env.FRONTEND_URL = 'http://localhost:3001';

    mockQuery = jest.fn();
    (pool.query as jest.Mock) = mockQuery;

    mockSendMail.mockClear();
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });
  });

  afterEach(() => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.FRONTEND_URL;
    jest.clearAllMocks();
  });

  describe('sendAppointmentReminder', () => {
    const mockAppointment = {
      id: 'apt-1',
      title: 'Legal Consultation',
      start_time: '2026-01-20T10:00:00Z',
      end_time: '2026-01-20T11:00:00Z',
      appointment_type: 'consultation',
      status: 'confirmed',
      location_address: '123 Main St',
      meeting_url: 'https://meet.example.com',
      reminder_24h_sent: false,
      reminder_2h_sent: false,
      lawyer_first_name: 'Marie',
      lawyer_last_name: 'Martin',
      lawyer_email: 'lawyer@test.com',
      client_first_name: 'Jean',
      client_last_name: 'Dupont',
      client_email: 'client@test.com',
    };

    it('should send 24h reminder to both lawyer and client', async () => {
      mockQuery.mockResolvedValue({ rows: [mockAppointment] });

      const result = await sendAppointmentReminder('apt-1', '24h');

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.id = $1'),
        ['apt-1']
      );
      expect(mockSendMail).toHaveBeenCalledTimes(2);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'lawyer@test.com',
          subject: expect.stringContaining('Rappel'),
          html: expect.stringContaining('demain'),
        })
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@test.com',
          subject: expect.stringContaining('Rappel'),
        })
      );
    });

    it('should send 2h reminder', async () => {
      mockQuery.mockResolvedValue({ rows: [mockAppointment] });

      const result = await sendAppointmentReminder('apt-1', '2h');

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('dans 2 heures'),
        })
      );
    });

    it('should not send if 24h reminder already sent', async () => {
      mockQuery.mockResolvedValue({
        rows: [{ ...mockAppointment, reminder_24h_sent: true }],
      });

      const result = await sendAppointmentReminder('apt-1', '24h');

      expect(result).toBe(false);
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should not send if 2h reminder already sent', async () => {
      mockQuery.mockResolvedValue({
        rows: [{ ...mockAppointment, reminder_2h_sent: true }],
      });

      const result = await sendAppointmentReminder('apt-1', '2h');

      expect(result).toBe(false);
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should return false if appointment not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await sendAppointmentReminder('apt-1', '24h');

      expect(result).toBe(false);
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should only send for pending or confirmed appointments', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await sendAppointmentReminder('apt-1', '24h');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("status IN ('pending', 'confirmed')"),
        expect.any(Array)
      );
    });

    it('should include appointment details in email', async () => {
      mockQuery.mockResolvedValue({ rows: [mockAppointment] });

      await sendAppointmentReminder('apt-1', '24h');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Legal Consultation'),
        })
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('123 Main St'),
        })
      );
    });

    it('should include meeting URL if available', async () => {
      mockQuery.mockResolvedValue({ rows: [mockAppointment] });

      await sendAppointmentReminder('apt-1', '24h');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://meet.example.com'),
        })
      );
    });

    it('should handle email sending errors', async () => {
      mockQuery.mockResolvedValue({ rows: [mockAppointment] });
      mockSendMail.mockRejectedValue(new Error('Email failed'));

      await expect(sendAppointmentReminder('apt-1', '24h')).rejects.toThrow();
    });

    it('should update reminder_24h_sent flag after sending', async () => {
      mockQuery.mockResolvedValue({ rows: [mockAppointment] });

      await sendAppointmentReminder('apt-1', '24h');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointments'),
        expect.arrayContaining(['apt-1'])
      );
    });

    it('should update reminder_2h_sent flag after sending', async () => {
      mockQuery.mockResolvedValue({ rows: [mockAppointment] });

      await sendAppointmentReminder('apt-1', '2h');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointments'),
        expect.arrayContaining(['apt-1'])
      );
    });

    it('should format date and time in French locale', async () => {
      mockQuery.mockResolvedValue({ rows: [mockAppointment] });

      await sendAppointmentReminder('apt-1', '24h');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.any(String),
        })
      );
    });

    it('should handle missing location address', async () => {
      const appointmentWithoutAddress = {
        ...mockAppointment,
        location_address: null,
      };
      mockQuery.mockResolvedValue({ rows: [appointmentWithoutAddress] });

      const result = await sendAppointmentReminder('apt-1', '24h');

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalled();
    });

    it('should handle missing meeting URL', async () => {
      const appointmentWithoutUrl = {
        ...mockAppointment,
        meeting_url: null,
      };
      mockQuery.mockResolvedValue({ rows: [appointmentWithoutUrl] });

      const result = await sendAppointmentReminder('apt-1', '24h');

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalled();
    });
  });
});